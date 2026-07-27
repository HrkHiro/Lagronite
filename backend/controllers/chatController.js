const prisma = require('../utils/prisma')
const { serializeChat } = require('../utils/serializers')

async function getReport(reportType, reportId) {
  if (reportType === 'lost') {
    return prisma.lostItem.findUnique({
      where: { id: reportId },
      include: { owner: { select: { id: true, name: true, email: true, role: true } } },
    })
  }

  if (reportType === 'found') {
    return prisma.foundItem.findUnique({
      where: { id: reportId },
      include: { finder: { select: { id: true, name: true, email: true, role: true } } },
    })
  }

  return null
}

async function authorizeReportAccess(user, reportType, report) {
  if (!report) return false
  if (user.role === 'admin') return true

  const userId = user.id || user._id

  if (reportType === 'lost') {
    return report.owner && report.owner.id === userId
  }

  return report.finder && report.finder.id === userId
}

async function getOrCreateChat(reportType, reportId, participantIds) {
  const uniqueWhere = { reportType_reportId: { reportType, reportId } };

  let chat = await prisma.reportChat.findUnique({
    where: uniqueWhere,
    include: {
      participants: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
    },
  });

  if (!chat) {
    chat = await prisma.reportChat.create({
      data: { reportType, reportId },
    });
  }

  await prisma.reportChatParticipant.createMany({
    data: participantIds.map((userId) => ({ chatId: chat.id, userId })),
    skipDuplicates: true,
  });

  return prisma.reportChat.findUnique({
    where: uniqueWhere,
    include: {
      participants: { include: { user: true } },
      messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
    },
  });
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

    const reporterId = reportType === 'lost' ? report.owner.id : report.finder.id
    const chat = await getOrCreateChat(reportType, reportId, [reporterId, req.user.id || req.user._id])

    return res.status(200).json({ chat: serializeChat(chat) })
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

    const reporterId = reportType === 'lost' ? report.owner.id : report.finder.id
    const userId = req.user.id || req.user._id
    const chat = await getOrCreateChat(reportType, reportId, [reporterId, userId])

    await prisma.chatMessage.create({
      data: {
        chatId: chat.id,
        senderId: userId,
        text: text.trim(),
      },
    })

    const updatedChat = await prisma.reportChat.findUnique({
      where: { reportType_reportId: { reportType, reportId } },
      include: {
        participants: { include: { user: true } },
        messages: { include: { sender: true }, orderBy: { createdAt: 'asc' } },
      },
    })

    return res.status(200).json({ chat: serializeChat(updatedChat) })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send message', error: error.message })
  }
}

exports.closeChat = async (req, res) => {
  try {
    const { reportType, reportId } = req.params
    const chat = await prisma.reportChat.findUnique({
      where: { reportType_reportId: { reportType, reportId } },
    })

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' })
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can close chat' })
    }

    await prisma.reportChat.update({
      where: { id: chat.id },
      data: { isClosed: true },
    })

    return res.status(200).json({ message: 'Chat closed successfully' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to close chat', error: error.message })
  }
}
