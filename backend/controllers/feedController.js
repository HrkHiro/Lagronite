const prisma = require('../utils/prisma');
const {
  mapLostItem,
  mapFoundItem,
  applyTextSearch,
  matchesDateFilter,
} = require('../utils/itemMapper');
const { serializeComment } = require('../utils/serializers');

const REACTION_TYPES = ['like', 'helpful', 'interested'];

async function findItemByType(reportType, reportId) {
  if (reportType === 'lost') {
    return prisma.lostItem.findUnique({
      where: { id: reportId },
      include: { owner: { select: { id: true, name: true, role: true, email: true } } },
    });
  }

  if (reportType === 'found') {
    return prisma.foundItem.findUnique({
      where: { id: reportId },
      include: { finder: { select: { id: true, name: true, role: true, email: true } } },
    });
  }

  return null;
}

function mapItemByType(reportType, item) {
  if (!item) {
    return null;
  }

  return reportType === 'lost' ? mapLostItem(item) : mapFoundItem(item);
}

async function fetchCampusItems() {
  const [lostItems, foundItems] = await Promise.all([
    prisma.lostItem.findMany({
      include: { owner: { select: { id: true, name: true, role: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.foundItem.findMany({
      include: { finder: { select: { id: true, name: true, role: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  return [...lostItems.map(mapLostItem), ...foundItems.map(mapFoundItem)].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
  );
}

async function getSocialStatsForItems(items, userId) {
  if (items.length === 0) {
    return items;
  }

  const itemKeys = items.map((item) => ({
    itemType: item.reportType,
    itemId: item.id,
  }));

  const [commentCounts, reactions] = await Promise.all([
    prisma.itemComment.groupBy({
      by: ['itemType', 'itemId'],
      where: { OR: itemKeys },
      _count: { _all: true },
    }),
    prisma.itemReaction.findMany({
      where: { OR: itemKeys },
      select: {
        itemType: true,
        itemId: true,
        userId: true,
        reactionType: true,
      },
    }),
  ]);

  const commentCountMap = new Map(
    commentCounts.map((entry) => [
      `${entry.itemType}:${String(entry.itemId)}`,
      entry._count._all,
    ]),
  );

  const reactionSummaryMap = new Map();
  const userReactionMap = new Map();

  reactions.forEach((reaction) => {
    const key = `${reaction.itemType}:${String(reaction.itemId)}`;

    if (!reactionSummaryMap.has(key)) {
      reactionSummaryMap.set(key, { like: 0, helpful: 0, interested: 0, total: 0 });
    }

    const summary = reactionSummaryMap.get(key);
    summary[reaction.reactionType] += 1;
    summary.total += 1;

    if (String(reaction.userId) === String(userId)) {
      userReactionMap.set(key, reaction.reactionType);
    }
  });

  return items.map((item) => {
    const key = `${item.reportType}:${String(item.id)}`;
    const reactionsSummary = reactionSummaryMap.get(key) || {
      like: 0,
      helpful: 0,
      interested: 0,
      total: 0,
    };

    return {
      ...item,
      commentCount: commentCountMap.get(key) || 0,
      reactions: reactionsSummary,
      userReaction: userReactionMap.get(key) || null,
    };
  });
}

function filterItems(items, query) {
  const status = query.status?.trim();
  const search = query.search?.trim();
  const category = query.category?.trim();
  const color = query.color?.trim();
  const date = query.date?.trim();
  const reportType = query.type?.trim();
  const postedBy = query.postedBy?.trim();

  let filtered = items;

  if (reportType === 'lost' || reportType === 'found') {
    filtered = filtered.filter((item) => item.reportType === reportType);
  }

  if (postedBy === 'admin') {
    filtered = filtered.filter((item) => item.postedByAdmin);
  }

  filtered = applyTextSearch(filtered, search);

  if (status) {
    filtered = filtered.filter((item) => item.status === status);
  }

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (color) {
    filtered = filtered.filter((item) => item.color === color);
  }

  if (date) {
    filtered = filtered.filter((item) => matchesDateFilter(item, date));
  }

  return filtered;
}

exports.listFeed = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);

    const campusItems = await fetchCampusItems();
    const filteredItems = filterItems(campusItems, req.query);
    const enrichedItems = await getSocialStatsForItems(filteredItems, req.user.id || req.user._id);

    const totalItems = enrichedItems.length;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedItems = enrichedItems.slice(startIndex, startIndex + limit);

    const lostCount = campusItems.filter((item) => item.reportType === 'lost').length;
    const foundCount = campusItems.filter((item) => item.reportType === 'found').length;
    const adminCount = campusItems.filter((item) => item.postedByAdmin).length;

    return res.status(200).json({
      items: paginatedItems,
      stats: {
        totalItems: campusItems.length,
        lostCount,
        foundCount,
        adminCount,
      },
      pagination: {
        page: currentPage,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch campus feed',
      error: error.message,
    });
  }
};

exports.getFeedItem = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;
    const itemDocument = await findItemByType(reportType, reportId);

    if (!itemDocument) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = mapItemByType(reportType, itemDocument);
    const [comments, reactions] = await Promise.all([
      prisma.itemComment.findMany({
        where: { itemType: reportType, itemId: reportId },
        include: { user: { select: { id: true, name: true, role: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.itemReaction.findMany({
        where: { itemType: reportType, itemId: reportId },
      }),
    ]);

    const reactionSummary = { like: 0, helpful: 0, interested: 0, total: 0 };
    let userReaction = null;

    reactions.forEach((reaction) => {
      reactionSummary[reaction.reactionType] += 1;
      reactionSummary.total += 1;

      if (String(reaction.userId) === String(req.user.id || req.user._id)) {
        userReaction = reaction.reactionType;
      }
    });

    return res.status(200).json({
      item: {
        ...item,
        commentCount: comments.length,
        reactions: reactionSummary,
        userReaction,
      },
      comments: comments.map(serializeComment),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch item details',
      error: error.message,
    });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;
    const content = req.body.content?.trim();

    if (!content) {
      return res.status(400).json({ message: 'Comment is required' });
    }

    const itemDocument = await findItemByType(reportType, reportId);

    if (!itemDocument) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const comment = await prisma.itemComment.create({
      data: {
        itemType: reportType,
        itemId: reportId,
        userId: req.user.id || req.user._id,
        content,
      },
      include: { user: { select: { id: true, name: true, role: true, email: true } } },
    });

    return res.status(201).json({
      message: 'Comment added successfully',
      comment: serializeComment(comment),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to add comment',
      error: error.message,
    });
  }
};

exports.toggleReaction = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;
    const { reactionType } = req.body;

    if (!REACTION_TYPES.includes(reactionType)) {
      return res.status(400).json({ message: 'Invalid reaction type' });
    }

    const itemDocument = await findItemByType(reportType, reportId);

    if (!itemDocument) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const userId = req.user.id || req.user._id;
    const existingReaction = await prisma.itemReaction.findFirst({
      where: {
        itemType: reportType,
        itemId: reportId,
        userId,
      },
    });

    if (existingReaction?.reactionType === reactionType) {
      await prisma.itemReaction.delete({ where: { id: existingReaction.id } });

      return res.status(200).json({
        message: 'Reaction removed',
        userReaction: null,
      });
    }

    if (existingReaction) {
      await prisma.itemReaction.update({
        where: { id: existingReaction.id },
        data: { reactionType },
      });

      return res.status(200).json({
        message: 'Reaction updated',
        userReaction: reactionType,
      });
    }

    await prisma.itemReaction.create({
      data: {
        itemType: reportType,
        itemId: reportId,
        userId,
        reactionType,
      },
    });

    return res.status(201).json({
      message: 'Reaction added',
      userReaction: reactionType,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update reaction',
      error: error.message,
    });
  }
};