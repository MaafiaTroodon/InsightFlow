import express from 'express';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Construction company mock data — in production these would query real DB tables
const COMPANY = {
  name: 'Meridian Construction Group',
  ytdRevenue: 58_420_000,
  ytdCost: 44_850_000,
  ytdProfit: 13_570_000,
  ytdMargin: 23.2,
  cashBalance: 8_340_000,
  arBalance: 12_180_000,
  apBalance: 6_250_000,
  healthScore: 84,
  employees: 340,
};

const PROJECTS_DATA = [
  { id: 'proj-001', name: 'Skyline Tower Residences', status: 'At Risk',   risk: 'High',   completionPct: 58,  budget: 14_200_000, actualCost: 9_840_000,  forecastCost: 15_640_000, profitability: -2.1 },
  { id: 'proj-002', name: 'Harbor Bridge Phase 2',   status: 'Delayed',   risk: 'Medium', completionPct: 72,  budget: 22_500_000, actualCost: 17_280_000, forecastCost: 23_100_000, profitability: 14.8 },
  { id: 'proj-003', name: 'Westside Commerce Mall',  status: 'On Track',  risk: 'Low',    completionPct: 41,  budget: 8_800_000,  actualCost: 3_610_000,  forecastCost: 8_620_000,  profitability: 21.3 },
  { id: 'proj-004', name: 'Central Station Mixed-Use',status:'Active',    risk: 'Medium', completionPct: 22,  budget: 31_000_000, actualCost: 6_820_000,  forecastCost: 30_440_000, profitability: 18.6 },
  { id: 'proj-005', name: 'Northgate Medical Center', status: 'Completed', risk: 'Low',   completionPct: 100, budget: 18_400_000, actualCost: 17_840_000, forecastCost: 17_840_000, profitability: 23.8 },
  { id: 'proj-006', name: 'Peninsula Tech Campus',    status: 'On Hold',   risk: 'Medium', completionPct: 8,   budget: 42_000_000, actualCost: 3_360_000,  forecastCost: 41_200_000, profitability: 19.2 },
];

// GET /api/enterprise/dashboard — executive summary
router.get('/dashboard', requireAuth, (_req, res) => {
  const totalBudget   = PROJECTS_DATA.reduce((s, p) => s + p.budget, 0);
  const totalActual   = PROJECTS_DATA.reduce((s, p) => s + p.actualCost, 0);
  const totalForecast = PROJECTS_DATA.reduce((s, p) => s + p.forecastCost, 0);

  res.json({
    company: COMPANY,
    portfolio: {
      totalBudget,
      totalActual,
      totalForecast,
      budgetVariancePct: ((totalForecast - totalBudget) / totalBudget * 100).toFixed(2),
      projectCount: PROJECTS_DATA.length,
      activeCount: PROJECTS_DATA.filter(p => p.status !== 'Completed').length,
      atRiskCount: PROJECTS_DATA.filter(p => p.risk === 'High').length,
    },
    projects: PROJECTS_DATA,
  });
});

// GET /api/enterprise/projects — project list with filtering
router.get('/projects', requireAuth, (req, res) => {
  const { status, risk, search } = req.query;
  let results = [...PROJECTS_DATA];

  if (status && status !== 'All') results = results.filter(p => p.status === status);
  if (risk   && risk   !== 'All') results = results.filter(p => p.risk === risk);
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(p => p.name.toLowerCase().includes(q));
  }

  res.json({ projects: results, total: results.length });
});

// GET /api/enterprise/kpis — aggregated KPIs for analytics
router.get('/kpis', requireAuth, (_req, res) => {
  const totalRevenue  = COMPANY.ytdRevenue;
  const totalProfit   = COMPANY.ytdProfit;
  const avgMargin     = COMPANY.ytdMargin;
  const cashBurnRate  = COMPANY.ytdCost / 12;

  res.json({
    revenue:  { value: totalRevenue,  change: 11.2, unit: 'usd' },
    profit:   { value: totalProfit,   change: 8.4,  unit: 'usd' },
    margin:   { value: avgMargin,     change: 1.8,  unit: 'pct' },
    burnRate: { value: cashBurnRate,  change: 3.1,  unit: 'usd' },
    healthScore: COMPANY.healthScore,
  });
});

// GET /api/enterprise/insights — rule-based AI insights
router.get('/insights', requireAuth, (_req, res) => {
  const insights = [];

  PROJECTS_DATA.forEach(p => {
    const variance = ((p.forecastCost - p.budget) / p.budget) * 100;

    if (variance > 8) {
      insights.push({
        type: 'danger',
        category: 'Budget Risk',
        project: p.name,
        message: `${p.name} forecast exceeds budget by ${variance.toFixed(1)}% ($${((p.forecastCost - p.budget)/1e6).toFixed(1)}M).`,
        severity: 3,
      });
    } else if (variance > 3) {
      insights.push({
        type: 'warning',
        category: 'Budget',
        project: p.name,
        message: `${p.name} is tracking ${variance.toFixed(1)}% above budget. Monitor closely.`,
        severity: 2,
      });
    }

    if (p.status === 'Delayed') {
      insights.push({
        type: 'warning',
        category: 'Schedule',
        project: p.name,
        message: `${p.name} is delayed. Review milestone schedule with PM.`,
        severity: 2,
      });
    }

    if (p.profitability < 10 && p.status !== 'Completed') {
      insights.push({
        type: 'danger',
        category: 'Profitability',
        project: p.name,
        message: `${p.name} has low profitability (${p.profitability}%). Cost containment action required.`,
        severity: 3,
      });
    }
  });

  // Company-level insights
  if (COMPANY.arBalance > COMPANY.cashBalance) {
    insights.push({
      type: 'warning',
      category: 'Cash Flow',
      project: null,
      message: `AR balance ($${(COMPANY.arBalance/1e6).toFixed(1)}M) exceeds cash position ($${(COMPANY.cashBalance/1e6).toFixed(1)}M). Accelerate collections.`,
      severity: 2,
    });
  }

  // Sort by severity
  insights.sort((a, b) => b.severity - a.severity);

  res.json({ insights, count: insights.length });
});

// GET /api/enterprise/cashflow — cashflow projection
router.get('/cashflow', requireAuth, (_req, res) => {
  res.json({
    currentBalance: COMPANY.cashBalance,
    arPipeline: COMPANY.arBalance,
    apObligations: COMPANY.apBalance,
    forecast: [
      { month: 'Feb', inflow: 5_200_000, outflow: 4_100_000, net: 1_100_000 },
      { month: 'Mar', inflow: 5_840_000, outflow: 4_480_000, net: 1_360_000 },
      { month: 'Apr', inflow: 6_120_000, outflow: 4_740_000, net: 1_380_000 },
      { month: 'May', inflow: 5_680_000, outflow: 4_380_000, net: 1_300_000 },
      { month: 'Jun', inflow: 6_840_000, outflow: 5_240_000, net: 1_600_000 },
    ],
  });
});

// GET /api/enterprise/notifications — system alerts
router.get('/notifications', requireAuth, (_req, res) => {
  const notifications = [
    { id: 'n1', type: 'danger',  category: 'Budget',   title: 'Skyline Tower over budget',      time: '2m ago',  read: false },
    { id: 'n2', type: 'warning', category: 'Schedule', title: 'Harbor Bridge delayed',           time: '14m ago', read: false },
    { id: 'n3', type: 'danger',  category: 'Invoice',  title: 'INV-001 overdue — $1.84M',       time: '1h ago',  read: false },
    { id: 'n4', type: 'success', category: 'Milestone','title': 'Westside Mall: milestone done', time: '3h ago',  read: false },
    { id: 'n5', type: 'warning', category: 'Cost',     title: 'Labor cost spike on Central Station', time: '5h ago', read: false },
  ];
  res.json({ notifications, unreadCount: notifications.filter(n => !n.read).length });
});

export default router;
