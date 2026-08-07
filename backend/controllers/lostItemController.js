const prisma = require('../utils/prisma');
const { serializeLostItem } = require('../utils/serializers');
const { uploadItemImage } = require('../utils/cloudinary');
const { findPossibleMatchesForReport, findPossibleMatchesForDraft } = require('../utils/matchEngine');

exports.previewLostItem = async (req, res) => {
  try {
    const draft = req.body || {};

    if (!draft.itemName || !draft.category || !draft.color || !draft.description || !draft.dateLost || !draft.locationLost) {
      return res.status(200).json({
        message: 'Draft is incomplete; matching suggestions will appear as soon as the item details are filled out.',
        possibleMatches: [],
      });
    }

    const possibleMatches = await findPossibleMatchesForDraft('lost', draft, prisma);

    return res.status(200).json({
      message: 'Possible matches loaded',
      possibleMatches,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to preview lost item matches',
      error: error.message,
    });
  }
};

exports.createLostItem = async (req, res) => {
  try {
    const draft = req.body || {}
    const shouldIgnoreDuplicate = Boolean(draft.ignoreDuplicate)
    const previewMatches = await findPossibleMatchesForDraft('lost', draft, prisma)

    if (previewMatches.length > 0 && !shouldIgnoreDuplicate) {
      return res.status(409).json({
        message: 'A similar item report already exists. Review the suggestions before posting this report.',
        possibleMatches: previewMatches,
      })
    }

    const imageUrl = await uploadItemImage(req.body.image);

    const lostItem = await prisma.lostItem.create({
      data: {
        itemName: req.body.itemName.trim(),
        category: req.body.category,
        color: req.body.color,
        description: req.body.description.trim(),
        dateLost: new Date(req.body.dateLost),
        locationLost: req.body.locationLost.trim(),
        image: imageUrl,
        ownerId: req.user.id || req.user._id,
        status: 'Lost',
      },
    });

    const possibleMatches = await findPossibleMatchesForReport('lost', lostItem, prisma);

    return res.status(201).json({
      message: 'Lost item reported successfully',
      lostItem: serializeLostItem(lostItem),
      possibleMatches,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create lost item report',
      error: error.message,
    });
  }
};