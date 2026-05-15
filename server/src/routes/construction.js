import express from 'express';
import { prisma } from '../utils/prisma.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

const ownsProject = async (projectId, userId) =>
  prisma.constructionProject.findFirst({ where: { id: projectId, userId } });

// ── Projects ─────────────────────────────────────────────────────────────────

router.get('/construction/projects', requireAuth, async (req, res, next) => {
  try {
    const projects = await prisma.constructionProject.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            rfis: true,
            deficiencies: true,
            siteLogs: true,
            submittals: true,
          },
        },
      },
    });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects', requireAuth, async (req, res, next) => {
  try {
    const { name, clientName, address, type, status, budget, contractValue, startDate, endDate, percentComplete, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name is required.' });
    const project = await prisma.constructionProject.create({
      data: {
        userId: req.user.id,
        name,
        clientName: clientName || null,
        address: address || null,
        type: type || null,
        status: status || 'Active',
        budget: budget ? parseFloat(budget) : null,
        contractValue: contractValue ? parseFloat(contractValue) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        percentComplete: percentComplete ? parseInt(percentComplete) : 0,
        notes: notes || null,
      },
    });
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

router.get('/construction/projects/:id', requireAuth, async (req, res, next) => {
  try {
    const project = await prisma.constructionProject.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: {
        siteLogs: { orderBy: { date: 'desc' } },
        rfis: { orderBy: { createdAt: 'desc' } },
        deficiencies: { orderBy: { createdAt: 'desc' } },
        safetyRecords: { orderBy: { date: 'desc' } },
        submittals: { orderBy: { createdAt: 'desc' } },
        scheduleItems: { orderBy: { startDate: 'asc' } },
        trades: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    res.json(project);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await ownsProject(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Project not found.' });
    const { name, clientName, address, type, status, budget, contractValue, startDate, endDate, percentComplete, notes } = req.body;
    const updated = await prisma.constructionProject.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        clientName: clientName !== undefined ? (clientName || null) : existing.clientName,
        address: address !== undefined ? (address || null) : existing.address,
        type: type !== undefined ? (type || null) : existing.type,
        status: status ?? existing.status,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : existing.budget,
        contractValue: contractValue !== undefined ? (contractValue ? parseFloat(contractValue) : null) : existing.contractValue,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : existing.startDate,
        endDate: endDate !== undefined ? (endDate ? new Date(endDate) : null) : existing.endDate,
        percentComplete: percentComplete !== undefined ? parseInt(percentComplete) : existing.percentComplete,
        notes: notes !== undefined ? (notes || null) : existing.notes,
      },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id', requireAuth, async (req, res, next) => {
  try {
    const existing = await ownsProject(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ message: 'Project not found.' });
    await prisma.constructionProject.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Daily Site Logs ───────────────────────────────────────────────────────────

router.get('/construction/projects/:id/site-logs', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const logs = await prisma.dailySiteLog.findMany({
      where: { projectId: req.params.id },
      orderBy: { date: 'desc' },
    });
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/site-logs', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { date, weather, temperature, workers, notes, createdBy } = req.body;
    if (!date) return res.status(400).json({ message: 'Date is required.' });
    const log = await prisma.dailySiteLog.create({
      data: {
        projectId: req.params.id,
        date: new Date(date),
        weather: weather || null,
        temperature: temperature || null,
        workers: workers ? parseInt(workers) : null,
        notes: notes || null,
        createdBy: createdBy || null,
      },
    });
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/site-logs/:logId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.dailySiteLog.deleteMany({ where: { id: req.params.logId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── RFIs ─────────────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/rfis', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const rfis = await prisma.rFI.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
    res.json(rfis);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/rfis', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { number, subject, description, status, ballInCourt, submittedBy, assignedTo, dueDate } = req.body;
    if (!subject) return res.status(400).json({ message: 'Subject is required.' });
    const count = await prisma.rFI.count({ where: { projectId: req.params.id } });
    const rfi = await prisma.rFI.create({
      data: {
        projectId: req.params.id,
        number: number || `RFI-${String(count + 1).padStart(3, '0')}`,
        subject,
        description: description || null,
        status: status || 'Open',
        ballInCourt: ballInCourt || null,
        submittedBy: submittedBy || null,
        assignedTo: assignedTo || null,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.status(201).json(rfi);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id/rfis/:rfiId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { subject, description, status, ballInCourt, submittedBy, assignedTo, dueDate, answeredAt } = req.body;
    const rfi = await prisma.rFI.update({
      where: { id: req.params.rfiId },
      data: {
        subject: subject ?? undefined,
        description: description !== undefined ? (description || null) : undefined,
        status: status ?? undefined,
        ballInCourt: ballInCourt !== undefined ? (ballInCourt || null) : undefined,
        submittedBy: submittedBy !== undefined ? (submittedBy || null) : undefined,
        assignedTo: assignedTo !== undefined ? (assignedTo || null) : undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        answeredAt: answeredAt !== undefined ? (answeredAt ? new Date(answeredAt) : null) : undefined,
      },
    });
    res.json(rfi);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/rfis/:rfiId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.rFI.deleteMany({ where: { id: req.params.rfiId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Deficiencies ─────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/deficiencies', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const defs = await prisma.deficiency.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
    res.json(defs);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/deficiencies', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { description, location, trade, assignedTo, status, priority, dueDate } = req.body;
    if (!description) return res.status(400).json({ message: 'Description is required.' });
    const count = await prisma.deficiency.count({ where: { projectId: req.params.id } });
    const def = await prisma.deficiency.create({
      data: {
        projectId: req.params.id,
        number: `DEF-${String(count + 1).padStart(3, '0')}`,
        description,
        location: location || null,
        trade: trade || null,
        assignedTo: assignedTo || null,
        status: status || 'Open',
        priority: priority || 'Medium',
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    res.status(201).json(def);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id/deficiencies/:defId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { description, location, trade, assignedTo, status, priority, dueDate, resolvedAt } = req.body;
    const def = await prisma.deficiency.update({
      where: { id: req.params.defId },
      data: {
        description: description ?? undefined,
        location: location !== undefined ? (location || null) : undefined,
        trade: trade !== undefined ? (trade || null) : undefined,
        assignedTo: assignedTo !== undefined ? (assignedTo || null) : undefined,
        status: status ?? undefined,
        priority: priority ?? undefined,
        dueDate: dueDate !== undefined ? (dueDate ? new Date(dueDate) : null) : undefined,
        resolvedAt: resolvedAt !== undefined ? (resolvedAt ? new Date(resolvedAt) : null) : undefined,
      },
    });
    res.json(def);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/deficiencies/:defId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.deficiency.deleteMany({ where: { id: req.params.defId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Safety Records ────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/safety', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const records = await prisma.safetyRecord.findMany({ where: { projectId: req.params.id }, orderBy: { date: 'desc' } });
    res.json(records);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/safety', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { type, title, description, date, recordedBy, status } = req.body;
    if (!type || !title || !date) return res.status(400).json({ message: 'Type, title, and date are required.' });
    const record = await prisma.safetyRecord.create({
      data: {
        projectId: req.params.id,
        type,
        title,
        description: description || null,
        date: new Date(date),
        recordedBy: recordedBy || null,
        status: status || null,
      },
    });
    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/safety/:recordId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.safetyRecord.deleteMany({ where: { id: req.params.recordId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Submittals ────────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/submittals', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const subs = await prisma.submittal.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
    res.json(subs);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/submittals', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { title, trade, type, status, submittedBy, reviewedBy, submittedAt, reviewedAt, notes } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required.' });
    const count = await prisma.submittal.count({ where: { projectId: req.params.id } });
    const sub = await prisma.submittal.create({
      data: {
        projectId: req.params.id,
        number: `SUB-${String(count + 1).padStart(3, '0')}`,
        title,
        trade: trade || null,
        type: type || null,
        status: status || 'Pending',
        submittedBy: submittedBy || null,
        reviewedBy: reviewedBy || null,
        submittedAt: submittedAt ? new Date(submittedAt) : null,
        reviewedAt: reviewedAt ? new Date(reviewedAt) : null,
        notes: notes || null,
      },
    });
    res.status(201).json(sub);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id/submittals/:subId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { title, trade, type, status, submittedBy, reviewedBy, submittedAt, reviewedAt, notes } = req.body;
    const sub = await prisma.submittal.update({
      where: { id: req.params.subId },
      data: {
        title: title ?? undefined,
        trade: trade !== undefined ? (trade || null) : undefined,
        type: type !== undefined ? (type || null) : undefined,
        status: status ?? undefined,
        submittedBy: submittedBy !== undefined ? (submittedBy || null) : undefined,
        reviewedBy: reviewedBy !== undefined ? (reviewedBy || null) : undefined,
        submittedAt: submittedAt !== undefined ? (submittedAt ? new Date(submittedAt) : null) : undefined,
        reviewedAt: reviewedAt !== undefined ? (reviewedAt ? new Date(reviewedAt) : null) : undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
      },
    });
    res.json(sub);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/submittals/:subId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.submittal.deleteMany({ where: { id: req.params.subId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Schedule Items ────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/schedule', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const items = await prisma.scheduleItem.findMany({ where: { projectId: req.params.id }, orderBy: { startDate: 'asc' } });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/schedule', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { name, type, phase, startDate, endDate, percentComplete, predecessor, notes } = req.body;
    if (!name || !startDate || !endDate) return res.status(400).json({ message: 'Name, start date, and end date are required.' });
    const item = await prisma.scheduleItem.create({
      data: {
        projectId: req.params.id,
        name,
        type: type || 'Baseline',
        phase: phase || null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        percentComplete: percentComplete ? parseInt(percentComplete) : 0,
        predecessor: predecessor || null,
        notes: notes || null,
      },
    });
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id/schedule/:itemId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { name, type, phase, startDate, endDate, percentComplete, predecessor, notes } = req.body;
    const item = await prisma.scheduleItem.update({
      where: { id: req.params.itemId },
      data: {
        name: name ?? undefined,
        type: type ?? undefined,
        phase: phase !== undefined ? (phase || null) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        percentComplete: percentComplete !== undefined ? parseInt(percentComplete) : undefined,
        predecessor: predecessor !== undefined ? (predecessor || null) : undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
      },
    });
    res.json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/schedule/:itemId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.scheduleItem.deleteMany({ where: { id: req.params.itemId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// ── Trades ────────────────────────────────────────────────────────────────────

router.get('/construction/projects/:id/trades', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const trades = await prisma.projectTrade.findMany({ where: { projectId: req.params.id }, orderBy: { createdAt: 'desc' } });
    res.json(trades);
  } catch (err) {
    next(err);
  }
});

router.post('/construction/projects/:id/trades', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { companyName, contactName, email, phone, trade, contractValue, status, notes } = req.body;
    if (!companyName || !trade) return res.status(400).json({ message: 'Company name and trade are required.' });
    const t = await prisma.projectTrade.create({
      data: {
        projectId: req.params.id,
        userId: req.user.id,
        companyName,
        contactName: contactName || null,
        email: email || null,
        phone: phone || null,
        trade,
        contractValue: contractValue ? parseFloat(contractValue) : null,
        status: status || 'Active',
        notes: notes || null,
      },
    });
    res.status(201).json(t);
  } catch (err) {
    next(err);
  }
});

router.put('/construction/projects/:id/trades/:tradeId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    const { companyName, contactName, email, phone, trade, contractValue, status, notes } = req.body;
    const t = await prisma.projectTrade.update({
      where: { id: req.params.tradeId },
      data: {
        companyName: companyName ?? undefined,
        contactName: contactName !== undefined ? (contactName || null) : undefined,
        email: email !== undefined ? (email || null) : undefined,
        phone: phone !== undefined ? (phone || null) : undefined,
        trade: trade ?? undefined,
        contractValue: contractValue !== undefined ? (contractValue ? parseFloat(contractValue) : null) : undefined,
        status: status ?? undefined,
        notes: notes !== undefined ? (notes || null) : undefined,
      },
    });
    res.json(t);
  } catch (err) {
    next(err);
  }
});

router.delete('/construction/projects/:id/trades/:tradeId', requireAuth, async (req, res, next) => {
  try {
    const project = await ownsProject(req.params.id, req.user.id);
    if (!project) return res.status(404).json({ message: 'Project not found.' });
    await prisma.projectTrade.deleteMany({ where: { id: req.params.tradeId, projectId: req.params.id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

export default router;
