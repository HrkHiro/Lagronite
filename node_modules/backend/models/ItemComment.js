const mongoose = require('mongoose');

const itemCommentSchema = new mongoose.Schema(
  {
    itemType: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  },
);

itemCommentSchema.index({ itemType: 1, itemId: 1, createdAt: -1 });

module.exports = mongoose.model('ItemComment', itemCommentSchema);
