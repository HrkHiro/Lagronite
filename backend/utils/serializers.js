function toDateValue(value) {
  return value ? new Date(value) : null;
}

function serializeUser(user) {
  if (!user) {
    return null;
  }

  const id = user.id || user._id;

  return {
    id,
    _id: id,
    name: user.name,
    email: user.email,
    role: user.role,
    profileImage: user.profileImage || null,
    status: user.status,
    suspendedUntil: toDateValue(user.suspendedUntil),
    termsQuizScore: user.termsQuizScore ?? null,
    termsQuizPassed: Boolean(user.termsQuizPassed),
    termsAgreed: Boolean(user.termsAgreed),
    termsAgreedAt: toDateValue(user.termsAgreedAt),
    createdAt: toDateValue(user.createdAt),
    updatedAt: toDateValue(user.updatedAt),
  };
}

function serializeLostItem(item) {
  if (!item) {
    return null;
  }

  const reporter = serializeUser(item.owner || item.ownerId);

  return {
    id: item.id || item._id,
    _id: item.id || item._id,
    reportType: 'lost',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: toDateValue(item.dateLost),
    location: item.locationLost,
    image: item.image,
    status: item.status,
    claimerName: item.claimerName || null,
    reporter,
    postedBy: reporter,
    postedByAdmin: reporter?.role === 'admin',
    createdAt: toDateValue(item.createdAt),
    updatedAt: toDateValue(item.updatedAt),
  };
}

function serializeFoundItem(item) {
  if (!item) {
    return null;
  }

  const reporter = serializeUser(item.finder || item.finderId);

  return {
    id: item.id || item._id,
    _id: item.id || item._id,
    reportType: 'found',
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: toDateValue(item.dateFound),
    location: item.locationFound,
    image: item.image,
    status: item.status,
    claimerName: item.claimerName || null,
    reporter,
    postedBy: reporter,
    postedByAdmin: reporter?.role === 'admin',
    createdAt: toDateValue(item.createdAt),
    updatedAt: toDateValue(item.updatedAt),
  };
}

function serializeComment(comment) {
  if (!comment) {
    return null;
  }

  const author = serializeUser(comment.user || comment.userId);

  return {
    id: comment.id || comment._id,
    _id: comment.id || comment._id,
    content: comment.content,
    createdAt: toDateValue(comment.createdAt),
    updatedAt: toDateValue(comment.updatedAt),
    author,
  };
}

function serializeMessage(message) {
  if (!message) {
    return null;
  }

  const sender = serializeUser(message.sender || message.senderUser || message.senderId);

  return {
    id: message.id || message._id,
    _id: message.id || message._id,
    text: message.text,
    createdAt: toDateValue(message.createdAt),
    updatedAt: toDateValue(message.updatedAt),
    sender,
  };
}

function serializeChat(chat) {
  if (!chat) {
    return null;
  }

  const participants = (chat.participants || []).map((participant) =>
    serializeUser(participant.user || participant),
  );

  return {
    id: chat.id || chat._id,
    _id: chat.id || chat._id,
    reportType: chat.reportType,
    reportId: chat.reportId,
    participants,
    messages: (chat.messages || []).map(serializeMessage),
    isClosed: Boolean(chat.isClosed),
    createdAt: toDateValue(chat.createdAt),
    updatedAt: toDateValue(chat.updatedAt),
  };
}

module.exports = {
  serializeUser,
  serializeLostItem,
  serializeFoundItem,
  serializeComment,
  serializeMessage,
  serializeChat,
};