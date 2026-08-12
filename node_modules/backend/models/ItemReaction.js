const mongoose = require('mongoose');

const itemReactionSchema = new mongoose.Schema(
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
    reactionType: {
      type: String,
      enum: ['like', 'helpful', 'interested'],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

itemReactionSchema.index({ itemType: 1, itemId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ItemReaction', itemReactionSchema);
