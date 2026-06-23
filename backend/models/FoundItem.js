const mongoose = require('mongoose');

const foundItemSchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    color: {
      type: String,
      required: [true, 'Color is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    dateFound: {
      type: Date,
      required: [true, 'Date found is required'],
    },
    locationFound: {
      type: String,
      required: [true, 'Location found is required'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Image is required'],
    },
    finderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Lost', 'Found', 'Claimed', 'Returned'],
      default: 'Found',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('FoundItem', foundItemSchema);