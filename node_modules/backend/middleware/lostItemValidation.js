const allowedCategories = [
  'Electronics',
  'Books',
  'Stationery',
  'Clothing',
  'Accessories',
  'Documents',
  'Other',
];

const allowedColors = [
  'Black',
  'White',
  'Blue',
  'Red',
  'Green',
  'Yellow',
  'Pink',
  'Purple',
  'Gray',
  'Brown',
  'Other',
];

exports.validateLostItem = (req, res, next) => {
  const {
    itemName,
    category,
    color,
    description,
    dateLost,
    locationLost,
    image,
  } = req.body;

  const errors = {};

  if (!itemName || !itemName.trim()) errors.itemName = 'Item name is required';
  if (!category || !allowedCategories.includes(category)) errors.category = 'Select a valid category';
  if (!color || !allowedColors.includes(color)) errors.color = 'Select a valid color';
  if (!description || description.trim().length < 10) {
    errors.description = 'Description must be at least 10 characters';
  }
  if (!dateLost || Number.isNaN(Date.parse(dateLost))) errors.dateLost = 'Select a valid lost date';
  if (!locationLost || !locationLost.trim()) errors.locationLost = 'Location is required';
  if (!image || !image.startsWith('data:image/')) errors.image = 'Upload a valid image';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors,
    });
  }

  return next();
};