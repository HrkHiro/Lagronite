const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
)

const reportChatSchema = new mongoose.Schema(
  {
    reportType: {
      type: String,
      enum: ['lost', 'found'],
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    messages: [messageSchema],
    isClosed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model('ReportChat', reportChatSchema)
