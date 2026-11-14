# Expense Tracker (MERN)

A full-stack expense tracker. Sign in, log money in and money out, and see where it goes with charts.

**Stack:** MongoDB, Express, React (Vite), Node.js

## Features

- Sign up and sign in (passwords hashed with bcrypt, sessions with JWT)
- Add, edit and delete transactions (income or expense)
- Month-by-month view with a left-this-month balance
- Pie chart of spending by category and a 6-month income vs expense bar chart
- Search by note or category, filter by type
- Export the current list to CSV
- Each person only sees their own data
- Demo data script for quick testing

## What you need first

- [Node.js](https://nodejs.org) 18 or newer
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running on your computer (default port 27017)

## Run it

Open Git Bash in the project folder, then run these one at a time.

1. Install everything (one time):

   ```bash
   npm run setup
   ```

2. Create your settings file (one time):

   ```bash
   cp server/.env.example server/.env
   ```

   Open `server/.env` and change `JWT_SECRET` to any long random text.

3. (Optional) Add demo data. This makes a demo account with six months of transactions:

   ```bash
   npm run seed
   ```

   Sign in with `demo@example.com` and `demo1234`.

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173 in your browser.

The API runs on port 5000 and the React app on port 5173.

## Troubleshooting

- **"Could not connect to MongoDB"**: MongoDB is not running. On Windows, open Services and start "MongoDB Server", or run `mongod` in another terminal.
- **"Cannot reach the server"** in the browser: the API did not start. Look at the terminal for the error.
- **Port already in use**: change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.

## Change the currency

Edit `CURRENCY` at the top of `client/src/utils/format.js` (for example `'USD'`, `'INR'` or `'NPR'`).

## API

All routes except `auth/register` and `auth/login` need the header `Authorization: Bearer <token>`.

| Method | Route | What it does |
| --- | --- | --- |
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in |
| GET | `/api/auth/me` | Get the signed-in user |
| GET | `/api/transactions?month=YYYY-MM&type=&q=` | List transactions |
| GET | `/api/transactions/summary?month=YYYY-MM` | Totals and chart data |
| POST | `/api/transactions` | Add a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |

## Folder layout

```
expense-tracker/
├── server/          Express API + MongoDB models
│   ├── config/      database connection
│   ├── middleware/  JWT check, async helper
│   ├── models/      User, Transaction
│   ├── routes/      auth, transactions
│   ├── seed.js      demo data
│   └── server.js
└── client/          React app (Vite)
    └── src/
        ├── components/   form, list, charts, summary
        ├── context/      sign-in state
        ├── pages/        Login, Dashboard
        └── utils/        money/date helpers, CSV export
```
