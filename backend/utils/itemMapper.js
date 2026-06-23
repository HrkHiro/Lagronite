function mapLostItem(item) {
  const poster = item.ownerId;

  return {
    id: item._id,
    reportType: 'lost',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: item.dateLost,
    location: item.locationLost,
    image: item.image,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    postedBy: poster
      ? {
          id: poster._id,
          name: poster.name,
          role: poster.role,
        }
      : null,
    postedByAdmin: poster?.role === 'admin',
  };
}

function mapFoundItem(item) {
  const poster = item.finderId;

  return {
    id: item._id,
    reportType: 'found',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: item.dateFound,
    location: item.locationFound,
    image: item.image,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    postedBy: poster
      ? {
          id: poster._id,
          name: poster.name,
          role: poster.role,
        }
      : null,
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
  mapLostItem,
  mapFoundItem,
  applyTextSearch,
  matchesDateFilter,
};
