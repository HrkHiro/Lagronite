const prisma = require('../utils/prisma')

exports.createSystemQuery = async (req, res) => {
  try {
    const { title, description, severity, category } = req.body || {}

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({ message: 'Title and description are required' })
    }

    const query = await prisma.systemQuery.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        severity: severity || 'medium',
        category: category || 'bug',
        reporterId: req.user.id || req.user._id,
      },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return res.status(201).json({ message: 'System query submitted successfully', query })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to submit system query',
      error: error.message,
    })
  }
}

exports.listSystemQueries = async (req, res) => {
  try {
    const queries = await prisma.systemQuery.findMany({
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json({ queries })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to load system queries',
      error: error.message,
    })
  }
}

exports.updateSystemQueryStatus = async (req, res) => {
  try {
    const { queryId } = req.params
    const { status } = req.body || {}

    const query = await prisma.systemQuery.update({
      where: { id: queryId },
      data: { status },
      include: {
        reporter: { select: { id: true, name: true, email: true, role: true } },
      },
    })

    return res.status(200).json({ message: 'Query status updated', query })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to update query status',
      error: error.message,
    })
  }
}

exports.deleteSystemQuery = async (req, res) => {
  try {
    const { queryId } = req.params

    await prisma.systemQuery.delete({ where: { id: queryId } })

    return res.status(200).json({ message: 'System query deleted successfully' })
  } catch (error) {
    return res.status(500).json({
      message: 'Failed to delete system query',
      error: error.message,
    })
  }
}
