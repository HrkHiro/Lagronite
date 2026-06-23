const LostItem = require('../models/LostItem')
const FoundItem = require('../models/FoundItem')
const ReportChat = require('../models/ReportChat')

async function getReport(reportType, reportId) {
  if (reportType === 'lost') {
    return LostItem.findById(reportId).populate('ownerId', 'name email')
  }

  if (reportType === 'found') {
    return FoundItem.findById(reportId).populate('finderId', 'name email')
  }

  return null
}

async function authorizeReportAccess(user, reportType, report) {
  if (!report) return false
  if (user.role === 'admin') return true

  if (reportType === 'lost') {
    return report.ownerId && report.ownerId._id.toString() === user._id.toString()
  }

  return report.finderId && report.finderId._id.toString() === user._id.toString()
}

exports.getChatForReport = async (req, res) => {
  try {
    const { reportType, reportId } = req.params
    const report = await getReport(reportType, reportId)

    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    if (!(await authorizeReportAccess(req.user, reportType, report))) {
      return res.status(403).json({ message: 'Unauthorized to access chat' })
    }

    const reporterId = reportType === 'lost' ? report.ownerId._id : report.finderId._id
    const participants = [reporterId, req.user._id]

    let chat = await ReportChat.findOne({ reportType, reportId })

    if (!chat) {
      chat = await ReportChat.create({ reportType, reportId, participants, messages: [] })
    }

    await chat.populate({ path: 'messages.sender', select: 'name role email' })
    await chat.populate({ path: 'participants', select: 'name role email' })

    return res.status(200).json({ chat })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to load chat', error: error.message })
  }
}

exports.sendMessage = async (req, res) => {
  try {
    const { reportType, reportId } = req.params
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Message text is required' })
    }

    const report = await getReport(reportType, reportId)
    if (!report) {
      return res.status(404).json({ message: 'Report not found' })
    }

    if (!(await authorizeReportAccess(req.user, reportType, report))) {
      return res.status(403).json({ message: 'Unauthorized to send message' })
    }

    const chat = await ReportChat.findOneAndUpdate(
      { reportType, reportId },
      {
        $set: { participants: [reportType === 'lost' ? report.ownerId._id : report.finderId._id, req.user._id] },
        $push: { messages: { sender: req.user._id, text: text.trim() } },
      },
      { upsert: true, new: true },
    )

    await chat.populate({ path: 'messages.sender', select: 'name role email' })

    return res.status(200).json({ chat })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message', error: error.message })
  }
}

exports.closeChat = async (req, res) => {
  try {
    const { reportType, reportId } = req.params
    const chat = await ReportChat.findOne({ reportType, reportId })

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can close chat' })
    }

    chat.isClosed = true
    await chat.save()

    return res.status(200).json({ message: 'Chat closed successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to close chat', error: error.message })
  }
}
