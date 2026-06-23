const LostItem = require('../models/LostItem');
const { uploadItemImage } = require('../utils/cloudinary');

exports.createLostItem = async (req, res) => {
  try {
    const imageUrl = await uploadItemImage(req.body.image);

    const lostItem = await LostItem.create({
      itemName: req.body.itemName.trim(),
      category: req.body.category,
      color: req.body.color,
      description: req.body.description.trim(),
      dateLost: req.body.dateLost,
      locationLost: req.body.locationLost.trim(),
      image: imageUrl,
      ownerId: req.user._id,
      status: 'Lost',
    });

    return res.status(201).json({
      message: 'Lost item reported successfully',
      lostItem,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create lost item report',
      error: error.message,
    });
  }
};