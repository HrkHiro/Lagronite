const CATEGORY_WEIGHT = 30;
const COLOR_WEIGHT = 20;
const LOCATION_WEIGHT = 20;
const DATE_WEIGHT = 15;
const DESCRIPTION_WEIGHT = 15;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalizeText(value)
    .split(' ')
    .filter((token) => token.length > 2);
}

function jaccardSimilarity(left, right) {
  const leftTokens = new Set(tokenize(left));
  const rightTokens = new Set(tokenize(right));

  if (leftTokens.size === 0 || rightTokens.size === 0) {
    return 0;
  }

  let intersectionCount = 0;

  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) {
      intersectionCount += 1;
    }
  });

  const unionCount = new Set([...leftTokens, ...rightTokens]).size;

  if (unionCount === 0) {
    return 0;
  }

  return intersectionCount / unionCount;
}

function scoreCategoryMatch(candidate, report) {
  return normalizeText(candidate.category) === normalizeText(report.category) ? CATEGORY_WEIGHT : 0;
}

function scoreColorMatch(candidate, report) {
  return normalizeText(candidate.color) === normalizeText(report.color) ? COLOR_WEIGHT : 0;
}

function scoreLocationMatch(candidate, report) {
  const similarity = jaccardSimilarity(candidate.location, report.location);
  if (similarity >= 0.8) return LOCATION_WEIGHT;
  if (similarity >= 0.5) return Math.round(LOCATION_WEIGHT * 0.75);
  if (similarity >= 0.25) return Math.round(LOCATION_WEIGHT * 0.4);
  return 0;
}

function scoreDateSimilarity(candidate, report) {
  const candidateDate = new Date(candidate.date);
  const reportDate = new Date(report.date);

  if (Number.isNaN(candidateDate.getTime()) || Number.isNaN(reportDate.getTime())) {
    return 0;
  }

  const dayDifference = Math.abs(reportDate - candidateDate) / (1000 * 60 * 60 * 24);

  if (dayDifference <= 1) return DATE_WEIGHT;
  if (dayDifference <= 3) return Math.round(DATE_WEIGHT * 0.85);
  if (dayDifference <= 7) return Math.round(DATE_WEIGHT * 0.6);
  if (dayDifference <= 14) return Math.round(DATE_WEIGHT * 0.35);
  return 0;
}

function scoreDescriptionSimilarity(candidate, report) {
  const similarity = jaccardSimilarity(candidate.description, report.description);

  if (similarity >= 0.8) return DESCRIPTION_WEIGHT;
  if (similarity >= 0.5) return Math.round(DESCRIPTION_WEIGHT * 0.8);
  if (similarity >= 0.25) return Math.round(DESCRIPTION_WEIGHT * 0.45);
  return 0;
}

function calculateMatchScore(candidate, report) {
  const categoryScore = scoreCategoryMatch(candidate, report);
  const colorScore = scoreColorMatch(candidate, report);
  const locationScore = scoreLocationMatch(candidate, report);
  const dateScore = scoreDateSimilarity(candidate, report);
  const descriptionScore = scoreDescriptionSimilarity(candidate, report);

  const score = categoryScore + colorScore + locationScore + dateScore + descriptionScore;

  return {
    score,
    categoryScore,
    colorScore,
    locationScore,
    dateScore,
    descriptionScore,
  };
}

function toCandidateMap(item, reportType) {
  if (!item) {
    return null;
  }

  return {
    id: item.id,
    itemName: item.itemName,
    category: item.category,
    color: item.color,
    description: item.description,
    date: reportType === 'lost' ? item.dateLost : item.dateFound,
    location: reportType === 'lost' ? item.locationLost : item.locationFound,
    image: item.image,
    status: item.status,
    createdAt: item.createdAt,
    reportType,
  };
}

function buildDraftCandidate(reportType, draft) {
  const normalizedType = reportType === 'lost' ? 'lost' : 'found'

  return {
    id: draft.id || 'draft-preview',
    itemName: draft.itemName,
    category: draft.category,
    color: draft.color,
    description: draft.description,
    date: normalizedType === 'lost' ? draft.dateLost || draft.date : draft.dateFound || draft.date,
    location: normalizedType === 'lost' ? draft.locationLost || draft.location : draft.locationFound || draft.location,
    status: 'Draft',
    reportType: normalizedType,
    createdAt: new Date().toISOString(),
  }
}

async function findPossibleMatchesForReport(reportType, createdItem, prisma) {
  const oppositeReportType = reportType === 'lost' ? 'found' : 'lost';

  const candidate = toCandidateMap(createdItem, reportType);

  const query = oppositeReportType === 'found'
    ? prisma.foundItem.findMany({
        where: {
          status: { notIn: ['Claimed', 'Returned'] },
        },
        orderBy: { createdAt: 'desc' },
        include: { finder: { select: { id: true, name: true, email: true, role: true } } },
      })
    : prisma.lostItem.findMany({
        where: {
          status: { notIn: ['Claimed', 'Returned'] },
        },
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true, email: true, role: true } } },
      });

  const reports = await query;

  const matches = reports
    .map((report) => {
      const target = toCandidateMap(report, oppositeReportType);
      const scoreBreakdown = calculateMatchScore(candidate, target);

      return {
        id: `${target.id}-${candidate.id}`,
        reportType: target.reportType,
        score: scoreBreakdown.score,
        breakdown: scoreBreakdown,
        report: {
          id: target.id,
          reportType: target.reportType,
          itemName: target.itemName,
          category: target.category,
          color: target.color,
          description: target.description,
          date: target.date,
          location: target.location,
          image: target.image,
          status: target.status,
          createdAt: target.createdAt,
          postedBy: target.reportType === 'found' ? report.finder : report.owner,
        },
      };
    })
    .filter((result) => result.score >= 50)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);

  return matches;
}

async function findPossibleMatchesForDraft(reportType, draftPayload, prisma) {
  const candidate = buildDraftCandidate(reportType, draftPayload)

  const [lostReports, foundReports] = await Promise.all([
    prisma.lostItem.findMany({
      where: {
        status: { notIn: ['Claimed', 'Returned'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { id: true, name: true, email: true, role: true } } },
    }),
    prisma.foundItem.findMany({
      where: {
        status: { notIn: ['Claimed', 'Returned'] },
      },
      orderBy: { createdAt: 'desc' },
      include: { finder: { select: { id: true, name: true, email: true, role: true } } },
    }),
  ])

  const allReports = [
    ...lostReports.map((report) => ({ report, type: 'lost' })),
    ...foundReports.map((report) => ({ report, type: 'found' })),
  ]

  const matches = allReports
    .map(({ report, type }) => {
      const target = toCandidateMap(report, type)
      const scoreBreakdown = calculateMatchScore(candidate, target)

      return {
        id: `${target.id}-${candidate.id}`,
        reportType: target.reportType,
        score: scoreBreakdown.score,
        breakdown: scoreBreakdown,
        report: {
          id: target.id,
          reportType: target.reportType,
          itemName: target.itemName,
          category: target.category,
          color: target.color,
          description: target.description,
          date: target.date,
          location: target.location,
          image: target.image,
          status: target.status,
          createdAt: target.createdAt,
          postedBy: type === 'found' ? report.finder : report.owner,
        },
      }
    })
    .filter((result) => result.score >= 50)
    .sort((left, right) => right.score - left.score)
    .slice(0, 5)

  return matches
}

module.exports = {
  calculateMatchScore,
  findPossibleMatchesForReport,
  findPossibleMatchesForDraft,
};
