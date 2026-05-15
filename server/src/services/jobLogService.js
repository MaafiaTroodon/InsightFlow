// Rule-based AI analysis engine for construction job/site logs

const DELAY_PATTERNS = [
  /delay(?:ed|s)?(?:\s+(?:due\s+to|because\s+of|caused\s+by))?\s+([^.!?\n]{5,80})/gi,
  /(?:behind\s+schedule|held\s+up|stopped|halted|paused)\s+(?:due\s+to|because\s+of|by)\s+([^.!?\n]{5,80})/gi,
  /(?:weather|rain|wind|storm|flood)\s+delay/gi,
  /no[- ]show\s+(?:of|from|by)\s+([^.!?\n]{5,60})/gi,
  /waiting\s+(?:on|for)\s+([^.!?\n]{5,60})/gi,
  /(?:concrete|inspection|delivery|material|equipment)\s+(?:delivery\s+)?delayed?/gi,
];

const CONTRACTOR_PATTERNS = [
  /([A-Z][a-zA-Z\s&'-]{3,40})\s+(?:arrived|on\s+site|commenced|started|completed|finished|left)/gi,
  /(?:crew|team|workers?|tradesperson|subcontractor|contractor)\s+(?:from\s+)?([A-Z][a-zA-Z\s&'-]{3,40})/gi,
  /([A-Z][a-zA-Z\s&'-]{3,40})\s+(?:Plumbing|Electrical|Concreting|Roofing|Framing|Steel|HVAC|Excavation|Landscaping)/gi,
];

const RISK_KEYWORDS = {
  high: [
    'unsafe', 'hazard', 'accident', 'injury', 'near miss', 'emergency', 'collapse', 'fall',
    'electrical fault', 'gas leak', 'fire', 'flood damage', 'structural', 'critical',
    'over budget', 'cost overrun', 'significant delay', 'weeks behind',
  ],
  medium: [
    'delay', 'behind schedule', 'rework', 'defect', 'defective', 'damaged', 'broken',
    'missing material', 'wrong material', 'subcontractor issue', 'weather hold',
    'inspection failed', 'non-compliant', 'change order', 'variation',
  ],
  low: [
    'minor', 'small delay', 'waiting', 'on hold', 'pause', 'pending approval',
  ],
};

const ACTION_PATTERNS = [
  /(?:action\s+required|action\s+item|follow[\s-]up|to[\s-]do|must|need\s+to|should)[:\s]+([^.!?\n]{5,120})/gi,
  /(?:escalate|notify|contact|call|order|procure|schedule|arrange|book|confirm)[:\s]+([^.!?\n]{5,100})/gi,
  /(?:outstanding|pending|awaiting)[:\s]+([^.!?\n]{5,100})/gi,
];

const WEATHER_PATTERNS = {
  rain:        /\brain(?:ing|y|fall|storm)?\b/i,
  wind:        /\bwind(?:y|s|storm)?\b/i,
  hot:         /\b(?:hot|heat(?:wave)?|high\s+temp)\b/i,
  cold:        /\b(?:cold|frost|freeze|freezing|snow)\b/i,
  clear:       /\b(?:clear|sunny|fine|good\s+weather)\b/i,
  cloudy:      /\b(?:cloud|overcast|grey|gray)\b/i,
  storm:       /\b(?:storm|thunder|lightning|cyclone|hurricane)\b/i,
  fog:         /\b(?:fog|mist|haze)\b/i,
};

const extractDelays = (text) => {
  const delays = [];
  const seen = new Set();

  for (const pattern of DELAY_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const desc = (match[1] || match[0]).replace(/\s+/g, ' ').trim();
      const key = desc.toLowerCase().slice(0, 40);
      if (!seen.has(key) && desc.length >= 5) {
        seen.add(key);
        delays.push({ description: desc, source: 'log' });
      }
    }
  }

  return delays.slice(0, 10);
};

const extractContractors = (text) => {
  const names = new Set();

  for (const pattern of CONTRACTOR_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const name = (match[1] || '').trim();
      // Filter out common false positives
      if (name.length >= 4 && !/^(The|This|That|They|Work|Site|Area|Level|Zone|Floor|Block)$/i.test(name)) {
        names.add(name);
      }
    }
  }

  return [...names].slice(0, 8).map(name => ({ name, status: 'on-site' }));
};

const extractRisks = (text) => {
  const risks = [];
  const lowerText = text.toLowerCase();

  for (const keyword of RISK_KEYWORDS.high) {
    if (lowerText.includes(keyword)) {
      risks.push({ level: 'high', description: `Potential high-risk issue detected: "${keyword}"` });
    }
  }
  for (const keyword of RISK_KEYWORDS.medium) {
    if (lowerText.includes(keyword)) {
      risks.push({ level: 'medium', description: `Medium risk flag: "${keyword}"` });
    }
  }

  return risks.slice(0, 8);
};

const extractActionItems = (text) => {
  const items = [];
  const seen = new Set();

  for (const pattern of ACTION_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const item = (match[1] || match[0]).replace(/\s+/g, ' ').trim();
      const key = item.toLowerCase().slice(0, 40);
      if (!seen.has(key) && item.length >= 8) {
        seen.add(key);
        items.push({ task: item, priority: 'medium', status: 'open' });
      }
    }
  }

  return items.slice(0, 10);
};

const detectWeather = (text) => {
  for (const [condition, pattern] of Object.entries(WEATHER_PATTERNS)) {
    if (pattern.test(text)) return condition;
  }
  return null;
};

const assessRiskLevel = (text, delays, risks) => {
  const lowerText = text.toLowerCase();
  const highRiskWords = RISK_KEYWORDS.high;
  const hasHighRisk = highRiskWords.some(w => lowerText.includes(w));
  const hasHighRiskItem = risks.some(r => r.level === 'high');

  if (hasHighRisk || hasHighRiskItem)  return 'high';
  if (delays.length >= 2 || risks.length >= 2) return 'medium';
  if (delays.length >= 1 || risks.length >= 1) return 'low';
  return 'low';
};

const buildSummary = (text, delays, contractors, risks, actionItems, weather) => {
  const parts = [];

  // Character limit on the raw text for the summary
  const preview = text.slice(0, 800).replace(/\s+/g, ' ').trim();

  // Extract first sentence as opener
  const firstSentence = preview.match(/^[^.!?]{10,150}[.!?]/)?.[0]?.trim();
  if (firstSentence) parts.push(firstSentence);

  if (weather) parts.push(`Weather: ${weather}.`);

  if (delays.length > 0) {
    parts.push(`${delays.length} delay${delays.length > 1 ? 's' : ''} detected: ${delays[0].description.slice(0, 80)}.`);
  }

  if (contractors.length > 0) {
    const names = contractors.slice(0, 3).map(c => c.name).join(', ');
    parts.push(`Contractors on site: ${names}.`);
  }

  if (risks.length > 0) {
    const highCount = risks.filter(r => r.level === 'high').length;
    if (highCount > 0) parts.push(`⚠ ${highCount} high-risk flag${highCount > 1 ? 's' : ''} identified.`);
  }

  if (actionItems.length > 0) {
    parts.push(`${actionItems.length} action item${actionItems.length > 1 ? 's' : ''} outstanding.`);
  }

  return parts.join(' ') || `Site log recorded — ${text.split(/\s+/).length} words`;
};

export const analyzeJobLog = (rawText) => {
  const delays       = extractDelays(rawText);
  const contractors  = extractContractors(rawText);
  const risks        = extractRisks(rawText);
  const actionItems  = extractActionItems(rawText);
  const weather      = detectWeather(rawText);
  const riskLevel    = assessRiskLevel(rawText, delays, risks);
  const summary      = buildSummary(rawText, delays, contractors, risks, actionItems, weather);

  return { summary, delays, contractors, risks, actionItems, weather, riskLevel };
};
