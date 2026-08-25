const prisma = require('../utils/prisma');
const { serializeFoundItem } = require('../utils/serializers');
const { saveItemImageLocally } = require('../utils/localUpload');

exports.createFoundItem = async (req, res) => {
  try {
    const { itemName, category, color, description, dateFound, locationFound, image } = req.body;

    if (!itemName || !category || !color || !description || !dateFound || !locationFound || !image) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const imageUrl = await saveItemImageLocally(image);

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

    return res.status(201).json({
      message: 'Found item reported successfully',
      foundItem: serializeFoundItem(foundItem),
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to create found item report',
      error: error.message,
    });
  }
};