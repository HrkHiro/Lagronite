const prisma = require('../utils/prisma');
const { serializeFoundItem } = require('../utils/serializers');
const { uploadItemImage } = require('../utils/cloudinary');
const { findPossibleMatchesForReport, findPossibleMatchesForDraft } = require('../utils/matchEngine');

exports.previewFoundItem = async (req, res) => {
  try {
    const draft = req.body || {};

    if (!draft.itemName || !draft.category || !draft.color || !draft.description || !draft.dateFound || !draft.locationFound) {
      return res.status(200).json({
        message: 'Draft is incomplete; matching suggestions will appear as soon as the item details are filled out.',
        possibleMatches: [],
      });
    }

    const possibleMatches = await findPossibleMatchesForDraft('found', draft, prisma);

    return res.status(200).json({
      message: 'Possible matches loaded',
      possibleMatches,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to preview found item matches',
      error: error.message,
    });
  }
};

exports.createFoundItem = async (req, res) => {
  try {
    const { itemName, category, color, description, dateFound, locationFound, image } = req.body;

    if (!itemName || !category || !color || !description || !dateFound || !locationFound || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const draft = req.body || {}
    const shouldIgnoreDuplicate = Boolean(draft.ignoreDuplicate)
    const previewMatches = await findPossibleMatchesForDraft('found', draft, prisma)

    if (previewMatches.length > 0 && !shouldIgnoreDuplicate) {
      return res.status(409).json({
        message: 'A similar item report already exists. Review the suggestions before posting this report.',
        possibleMatches: previewMatches,
      })
    }

    const imageUrl = await uploadItemImage(image);

    const foundItem = await prisma.foundItem.create({
      data: {
        itemName: itemName.trim(),
        category,
        color,
        description: description.trim(),
        dateFound: new Date(dateFound),
        locationFound: locationFound.trim(),
        image: imageUrl,
        finderId: req.user.id || req.user._id,
        status: 'Found',
      },
    });

    const possibleMatches = await findPossibleMatchesForReport('found', foundItem, prisma);

    return res.status(201).json({
      message: 'Found item reported successfully',
      foundItem: serializeFoundItem(foundItem),
      possibleMatches,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create found item report',
      error: error.message,
    });
  }
};