const prisma = require('../utils/prisma')
const { mapLostItem, mapFoundItem } = require('../utils/itemMapper')

exports.getAdminExportData = async (req, res) => {
  try {
    const [users, lostItems, foundItems, comments, reactions, chats, chatMessages] = await Promise.all([
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lostItem.findMany({
        include: { owner: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.foundItem.findMany({
        include: { finder: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.itemComment.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.itemReaction.findMany({
        include: { user: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.reportChat.findMany({
        include: {
          participants: { include: { user: true } },
          messages: { orderBy: { createdAt: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.chatMessage.findMany({
        include: { sender: true },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return res.json({
      users,
      lostItems,
      foundItems,
      comments,
      reactions,
      chats,
      messages: chatMessages,
    })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load admin export data',
      error: error.message,
    })
  }
}

exports.listArchiveRecords = async (req, res) => {
  try {
    const records = await prisma.archiveRecord.findMany({
      orderBy: { deletedAt: 'desc' },
    })

    return res.status(200).json({ records })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load archive',
      error: error.message,
    })
  }
}

exports.getAdminDashboard = async (req, res) => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      prisma.lostItem.findMany({
        include: { owner: true },
      }),
      prisma.foundItem.findMany({
        include: { finder: true },
      }),
    ])

    const allItems = [...lostItems, ...foundItems]

    const totalReports = allItems.length
    const lostCount = lostItems.length
    const foundCount = foundItems.length

    // STATUS COUNTS
    const statusCounts = allItems.reduce((acc, item) => {
      const status = item.status || 'Unknown'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {})

    // CATEGORY COUNTS
    const categoryMap = allItems.reduce((acc, item) => {
      const cat = item.category || 'Unknown'
      acc[cat] = (acc[cat] || 0) + 1
      return acc
    }, {})

    const categories = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count,
    }))

    // RECENT REPORTS
    const recentReports = allItems
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((item) => ({
        id: item._id,
        itemName: item.itemName,
        category: item.category,
        status: item.status,
        createdAt: item.createdAt,
      }))

    // MONTHLY STATS
    const monthlyMap = {}

    allItems.forEach((item) => {
      const date = new Date(item.createdAt)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, lost: 0, found: 0 }
      }

      if (item.status === 'Lost') monthlyMap[key].lost++
      if (item.status === 'Found') monthlyMap[key].found++
    })

    const monthlyStats = Object.values(monthlyMap).sort(
      (a, b) => new Date(a.month) - new Date(b.month),
    )

    res.json({
      totalReports,
      lostCount,
      foundCount,
      statusCounts,
      categories,
      recentReports,
      monthlyStats,
    })
  } catch (error) {
    res.status(500).json({
      message: 'Failed to load dashboard',
      error: error.message,
    })
  }
}