// Creates a demo account with sample data: demo@example.com / demo1234
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Transaction = require('./models/Transaction');

const EXPENSES = [
  ['Food', 'Groceries', 40, 120],
  ['Food', 'Lunch with friends', 10, 35],
  ['Transport', 'Fuel', 20, 60],
  ['Bills', 'Electricity', 25, 55],
  ['Bills', 'Internet', 20, 30],
  ['Shopping', 'Clothes', 30, 150],
  ['Entertainment', 'Movie night', 8, 25],
  ['Health', 'Pharmacy', 10, 40],
  ['Education', 'Online course', 15, 60],
];

// Small repeatable "random" so the demo looks the same each time
let seedNum = 7;
const rand = () => ((seedNum = (seedNum * 9301 + 49297) % 233280) / 233280);
const between = (a, b) => Math.round((a + rand() * (b - a)) * 100) / 100;

(async () => {
  await connectDB();
  const old = await User.findOne({ email: 'demo@example.com' });
  if (old) {
    await Transaction.deleteMany({ user: old._id });
    await old.deleteOne();
  }

  const user = await User.create({ name: 'Demo User', email: 'demo@example.com', password: 'demo1234' });
  const now = new Date();
  const docs = [];

  for (let back = 5; back >= 0; back--) {
    const y = now.getUTCFullYear();
    const m = now.getUTCMonth() - back;
    const day = (d) => new Date(Date.UTC(y, m, d));

    docs.push({ type: 'income', category: 'Salary', amount: 1800, note: 'Monthly salary', date: day(1) });
    if (back % 2 === 0)
      docs.push({ type: 'income', category: 'Freelance', amount: between(150, 400), note: 'Side project', date: day(12) });
    docs.push({ type: 'expense', category: 'Rent', amount: 550, note: 'Monthly rent', date: day(2) });

    for (let i = 0; i < 9; i++) {
      const [category, note, lo, hi] = EXPENSES[Math.floor(rand() * EXPENSES.length)];
      docs.push({ type: 'expense', category, note, amount: between(lo, hi), date: day(3 + Math.floor(rand() * 24)) });
    }
  }

  await Transaction.insertMany(docs.map((d) => ({ ...d, user: user._id })));
  console.log(`Done. Added ${docs.length} transactions.`);
  console.log('Sign in with  demo@example.com  /  demo1234');
  await mongoose.disconnect();
})();
