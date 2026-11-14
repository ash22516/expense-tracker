const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();
router.use(auth);

const CATEGORIES = {
  expense: ['Food', 'Rent', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education', 'Other'],
  income: ['Salary', 'Freelance', 'Gift', 'Other'],
};

// "2026-11" -> { start: 1 Nov 2026, end: 1 Dec 2026 } (UTC)
function monthRange(month) {
  const m = /^(\d{4})-(\d{2})$/.exec(month || '');
  if (!m) return null;
  const year = Number(m[1]);
  const mo = Number(m[2]);
  if (mo < 1 || mo > 12) return null;
  return {
    start: new Date(Date.UTC(year, mo - 1, 1)),
    end: new Date(Date.UTC(year, mo, 1)),
    year,
    mo,
  };
}

function cleanInput(body) {
  const type = body.type;
  const amount = Number(body.amount);
  const category = body.category;
  const note = String(body.note || '').trim().slice(0, 200);
  const date = new Date(body.date);

  if (!['income', 'expense'].includes(type)) return { error: 'Type must be income or expense.' };
  if (!Number.isFinite(amount) || amount <= 0) return { error: 'Amount must be a number greater than 0.' };
  if (!CATEGORIES[type].includes(category)) return { error: 'Please pick a valid category.' };
  if (Number.isNaN(date.getTime())) return { error: 'Please pick a valid date.' };

  return { data: { type, amount: Math.round(amount * 100) / 100, category, note, date } };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const round = (n) => Math.round((n || 0) * 100) / 100;

// List (with optional month / type / search filters)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = { user: req.userId };

    const range = monthRange(req.query.month);
    if (range) filter.date = { $gte: range.start, $lt: range.end };

    if (['income', 'expense'].includes(req.query.type)) filter.type = req.query.type;

    const q = String(req.query.q || '').trim().slice(0, 60);
    if (q) {
      const re = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ note: re }, { category: re }];
    }

    const items = await Transaction.find(filter).sort({ date: -1, createdAt: -1 }).limit(500);
    res.json({ items });
  })
);

// Totals + chart data for one month
router.get(
  '/summary',
  asyncHandler(async (req, res) => {
    const now = new Date();
    const month = req.query.month || `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
    const range = monthRange(month);
    if (!range) return res.status(400).json({ message: 'Month must look like 2026-11.' });

    const user = new mongoose.Types.ObjectId(req.userId);
    const sixStart = new Date(Date.UTC(range.year, range.mo - 1 - 5, 1));

    const [totals, byCategory, monthlyRaw] = await Promise.all([
      Transaction.aggregate([
        { $match: { user, date: { $gte: range.start, $lt: range.end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { user, type: 'expense', date: { $gte: range.start, $lt: range.end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Transaction.aggregate([
        { $match: { user, date: { $gte: sixStart, $lt: range.end } } },
        {
          $group: {
            _id: { y: { $year: '$date' }, m: { $month: '$date' }, type: '$type' },
            total: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const income = round(totals.find((t) => t._id === 'income')?.total);
    const expense = round(totals.find((t) => t._id === 'expense')?.total);

    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(range.year, range.mo - 1 - i, 1));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth() + 1;
      const find = (type) =>
        monthlyRaw.find((r) => r._id.y === y && r._id.m === m && r._id.type === type)?.total;
      monthly.push({
        key: `${y}-${String(m).padStart(2, '0')}`,
        label: d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }),
        income: round(find('income')),
        expense: round(find('expense')),
      });
    }

    res.json({
      month,
      income,
      expense,
      balance: round(income - expense),
      byCategory: byCategory.map((c) => ({ category: c._id, total: round(c.total) })),
      monthly,
    });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { data, error } = cleanInput(req.body);
    if (error) return res.status(400).json({ message: error });
    const item = await Transaction.create({ ...data, user: req.userId });
    res.status(201).json({ item });
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id.' });
    const { data, error } = cleanInput(req.body);
    if (error) return res.status(400).json({ message: error });

    const item = await Transaction.findOneAndUpdate({ _id: req.params.id, user: req.userId }, data, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ item });
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid id.' });
    const item = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!item) return res.status(404).json({ message: 'Transaction not found.' });
    res.json({ ok: true });
  })
);

module.exports = router;
