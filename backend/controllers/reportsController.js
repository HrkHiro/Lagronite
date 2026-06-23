const LostItem = require('../models/LostItem');
const FoundItem = require('../models/FoundItem');

function mapLostItem(item) {
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
    claimerName: item.claimerName || null,
    reporter: item.ownerId
      ? {
          id: item.ownerId._id,
          name: item.ownerId.name,
          email: item.ownerId.email,
        }
      : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function mapFoundItem(item) {
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
    claimerName: item.claimerName || null,
    reporter: item.finderId
      ? {
          id: item.finderId._id,
          name: item.finderId.name,
          email: item.finderId.email,
        }
      : null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
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

exports.listAllReportsAdmin = async (req, res) => {
  try {
    const [lostItems, foundItems] = await Promise.all([
      LostItem.find().populate('ownerId', 'name email').sort({ createdAt: -1 }),
      FoundItem.find().populate('finderId', 'name email').sort({ createdAt: -1 }),
    ])

    const reports = [
      ...lostItems.map(mapLostItem),
      ...foundItems.map(mapFoundItem),
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return res.status(200).json({ reports })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch admin reports',
      error: error.message,
    })
  }
}

exports.listMyReports = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.max(parseInt(req.query.limit || '10', 10), 1);
    const status = req.query.status?.trim();
    const search = req.query.search?.trim();
    const category = req.query.category?.trim();
    const color = req.query.color?.trim();
    const date = req.query.date?.trim();

    const [lostItems, foundItems] = await Promise.all([
      LostItem.find({ ownerId: req.user._id }).sort({ createdAt: -1 }),
      FoundItem.find({ finderId: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const combinedReports = [...lostItems.map(mapLostItem), ...foundItems.map(mapFoundItem)].sort(
      (left, right) => new Date(right.createdAt) - new Date(left.createdAt),
    );

    const searchFilteredReports = applyTextSearch(combinedReports, search);
    const statusFilteredReports = status
      ? searchFilteredReports.filter((item) => item.status === status)
      : searchFilteredReports;

    const categoryFilteredReports = category
      ? statusFilteredReports.filter((item) => item.category === category)
      : statusFilteredReports;

    const colorFilteredReports = color
      ? categoryFilteredReports.filter((item) => item.color === color)
      : categoryFilteredReports;

    const dateFilteredReports = date
      ? colorFilteredReports.filter((item) => matchesDateFilter(item, date))
      : colorFilteredReports;

    const totalItems = dateFilteredReports.length;
    const totalPages = Math.max(Math.ceil(totalItems / limit), 1);
    const currentPage = Math.min(page, totalPages);
    const startIndex = (currentPage - 1) * limit;
    const paginatedReports = dateFilteredReports.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      reports: paginatedReports,
      pagination: {
        page: currentPage,
        limit,
        totalItems,
        totalPages,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch reports',
      error: error.message,
    });
  }
};

exports.getReportDetails = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;

    if (reportType === 'lost') {
      const report = await LostItem.findOne({ _id: reportId, ownerId: req.user._id });

      if (!report) {
        return res.status(404).json({ message: 'Lost report not found' });
      }

      return res.status(200).json({ report: mapLostItem(report) });
    }

    if (reportType === 'found') {
      const report = await FoundItem.findOne({ _id: reportId, finderId: req.user._id });

      if (!report) {
        return res.status(404).json({ message: 'Found report not found' });
      }

      return res.status(200).json({ report: mapFoundItem(report) });
    }

    return res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to fetch report details',
      error: error.message,
    });
  }
};

function pickUpdateFields(reportType, body) {
  const commonFields = {
    itemName: body.itemName,
    category: body.category,
    color: body.color,
    description: body.description,
    image: body.image,
    status: body.status,
    claimerName: body.claimerName,
  };

  if (reportType === 'lost') {
    return {
      ...commonFields,
      dateLost: body.date,
      locationLost: body.location,
    };
  }

  return {
    ...commonFields,
    dateFound: body.date,
    locationFound: body.location,
  };
}

exports.updateReport = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;
    const updateFields = pickUpdateFields(reportType, req.body);

    if (reportType === 'lost') {
      const updatedReport = await LostItem.findOneAndUpdate(
        { _id: reportId, ownerId: req.user._id },
        updateFields,
        { new: true, runValidators: true },
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Lost report not found' });
      }

      return res.status(200).json({
        message: 'Lost report updated successfully',
        report: mapLostItem(updatedReport),
      });
    }

    if (reportType === 'found') {
      const updatedReport = await FoundItem.findOneAndUpdate(
        { _id: reportId, finderId: req.user._id },
        updateFields,
        { new: true, runValidators: true },
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Found report not found' });
      }

      return res.status(200).json({
        message: 'Found report updated successfully',
        report: mapFoundItem(updatedReport),
      });
    }

    return res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update report',
      error: error.message,
    });
  }
};

exports.updateReportAdmin = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;
    const updateFields = pickUpdateFields(reportType, req.body);

    if (reportType === 'lost') {
      const updatedReport = await LostItem.findByIdAndUpdate(
        reportId,
        updateFields,
        { new: true, runValidators: true },
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Lost report not found' });
      }

      return res.status(200).json({
        message: 'Lost report updated successfully',
        report: mapLostItem(updatedReport),
      });
    }

    if (reportType === 'found') {
      const updatedReport = await FoundItem.findByIdAndUpdate(
        reportId,
        updateFields,
        { new: true, runValidators: true },
      );

      if (!updatedReport) {
        return res.status(404).json({ message: 'Found report not found' });
      }

      return res.status(200).json({
        message: 'Found report updated successfully',
        report: mapFoundItem(updatedReport),
      });
    }

    return res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update report',
      error: error.message,
    });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;

    if (reportType === 'lost') {
      const deletedReport = await LostItem.findOneAndDelete({ _id: reportId, ownerId: req.user._id });

      if (!deletedReport) {
        return res.status(404).json({ message: 'Lost report not found' });
      }

      return res.status(200).json({ message: 'Lost report deleted successfully' });
    }

    if (reportType === 'found') {
      const deletedReport = await FoundItem.findOneAndDelete({ _id: reportId, finderId: req.user._id });

      if (!deletedReport) {
        return res.status(404).json({ message: 'Found report not found' });
      }

      return res.status(200).json({ message: 'Found report deleted successfully' });
    }

    return res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete report',
      error: error.message,
    });
  }
};

exports.deleteReportAdmin = async (req, res) => {
  try {
    const { reportType, reportId } = req.params;

    if (reportType === 'lost') {
      const deletedReport = await LostItem.findByIdAndDelete(reportId);

      if (!deletedReport) {
        return res.status(404).json({ message: 'Lost report not found' });
      }

      return res.status(200).json({ message: 'Lost report deleted successfully' });
    }

    if (reportType === 'found') {
      const deletedReport = await FoundItem.findByIdAndDelete(reportId);

      if (!deletedReport) {
        return res.status(404).json({ message: 'Found report not found' });
      }

      return res.status(200).json({ message: 'Found report deleted successfully' });
    }

    return res.status(400).json({ message: 'Invalid report type' });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete report',
      error: error.message,
    });
  }
};
