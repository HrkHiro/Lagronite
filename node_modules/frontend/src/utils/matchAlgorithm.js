const CATEGORY_WEIGHT = 30
const COLOR_WEIGHT = 20
const LOCATION_WEIGHT = 20
const DATE_WEIGHT = 15
const DESCRIPTION_WEIGHT = 15

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2)
}

function jaccardSimilarity(left, right) {
  const leftTokens = new Set(tokenize(left))
  const rightTokens = new Set(tokenize(right))

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0
  }

  let intersectionCount = 0

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      intersectionCount += 1
    }
  })

  const unionCount = new Set([...leftTokens, ...rightTokens]).size

  if (unionCount === 0) {
    return 0
  }

  return intersectionCount / unionCount
}

function scoreCategoryMatch(lostItem, foundItem) {
  return normalizeText(lostItem.category) === normalizeText(foundItem.category) ? CATEGORY_WEIGHT : 0
}

function scoreColorMatch(lostItem, foundItem) {
  return normalizeText(lostItem.color) === normalizeText(foundItem.color) ? COLOR_WEIGHT : 0
}

function scoreLocationMatch(lostItem, foundItem) {
  const similarity = jaccardSimilarity(lostItem.location, foundItem.location)
  if (similarity >= 0.8) return LOCATION_WEIGHT
  if (similarity >= 0.5) return Math.round(LOCATION_WEIGHT * 0.75)
  if (similarity >= 0.25) return Math.round(LOCATION_WEIGHT * 0.4)
  return 0
}

function scoreDateSimilarity(lostItem, foundItem) {
  const lostDate = new Date(lostItem.date)
  const foundDate = new Date(foundItem.date)

  if (Number.isNaN(lostDate.getTime()) || Number.isNaN(foundDate.getTime())) {
    return 0
  }

  const dayDifference = Math.abs(foundDate - lostDate) / (1000 * 60 * 60 * 24)

  if (dayDifference <= 1) return DATE_WEIGHT
  if (dayDifference <= 3) return Math.round(DATE_WEIGHT * 0.85)
  if (dayDifference <= 7) return Math.round(DATE_WEIGHT * 0.6)
  if (dayDifference <= 14) return Math.round(DATE_WEIGHT * 0.35)
  return 0
}

function scoreDescriptionSimilarity(lostItem, foundItem) {
  const similarity = jaccardSimilarity(lostItem.description, foundItem.description)

  if (similarity >= 0.8) return DESCRIPTION_WEIGHT
  if (similarity >= 0.5) return Math.round(DESCRIPTION_WEIGHT * 0.8)
  if (similarity >= 0.25) return Math.round(DESCRIPTION_WEIGHT * 0.45)
  return 0
}

export function calculateMatchScore(lostItem, foundItem) {
  const categoryScore = scoreCategoryMatch(lostItem, foundItem)
  const colorScore = scoreColorMatch(lostItem, foundItem)
  const locationScore = scoreLocationMatch(lostItem, foundItem)
  const dateScore = scoreDateSimilarity(lostItem, foundItem)
  const descriptionScore = scoreDescriptionSimilarity(lostItem, foundItem)

  const score = categoryScore + colorScore + locationScore + dateScore + descriptionScore

  return {
    score,
    categoryScore,
    colorScore,
    locationScore,
    dateScore,
    descriptionScore,
  }
}

export function buildMatchSuggestions(lostItems, foundItems) {
  const suggestions = []

  lostItems.forEach((lostItem) => {
    foundItems.forEach((foundItem) => {
      const match = calculateMatchScore(lostItem, foundItem)

      if (match.score > 0) {
        suggestions.push({
          id: `${lostItem.id}-${foundItem.id}`,
          lostItem,
          foundItem,
          score: match.score,
          breakdown: match,
        })
      }
    })
  })

  return suggestions.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score
    }

    return new Date(right.foundItem.createdAt || 0) - new Date(left.foundItem.createdAt || 0)
  })
}

export function formatMatchPercent(score) {
  return `${Math.max(0, Math.min(100, Math.round(score)))}%`
}
