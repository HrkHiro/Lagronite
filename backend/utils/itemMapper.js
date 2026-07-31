function normalizeUser(user) {
  if (!user) {
    return null;
  }

  const id = user.id || user._id;

  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage || null,
  };
}

function mapLostItem(item) {
  const poster = normalizeUser(item.owner || item.ownerId);

  return {
    id: item.id || item._id,
    _id: item.id || item._id,
    reportType: 'lost',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: item.dateLost,
    location: item.locationLost,
    image: item.image,
    status: item.status,
    claimerName: item.claimerName || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    postedBy: poster,
    reporter: poster,
    postedByAdmin: poster?.role === 'admin',
  };
}

function mapFoundItem(item) {
  const poster = normalizeUser(item.finder || item.finderId);

  return {
    id: item.id || item._id,
    _id: item.id || item._id,
    reportType: 'found',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: item.dateFound,
    location: item.locationFound,
    image: item.image,
    status: item.status,
    claimerName: item.claimerName || null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    postedBy: poster,
    reporter: poster,
    postedByAdmin: poster?.role === 'admin',
  };
}

function applyTextSearch(items, searchTerm) {
  if (!searchTerm) {
    return items;
  }

  const normalizedSearch = searchTerm.toLowerCase();

  return items.filter((item) => {
    const searchableText = [
      item.itemName,
      item.category,
      item.color,
      item.description,
      item.location,
      item.status,
      item.reportType,
      item.postedBy?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}

function matchesDateFilter(item, dateFilter) {
  if (!dateFilter) {
    return true;
  }

  const itemDate = new Date(item.date);

  if (Number.isNaN(itemDate.getTime())) {
    return false;
  }

  const normalizedItemDate = itemDate.toISOString().slice(0, 10);
  return normalizedItemDate === dateFilter;
}

module.exports = {
  normalizeUser,
  mapLostItem,
  mapFoundItem,
  applyTextSearch,
  matchesDateFilter,
};
