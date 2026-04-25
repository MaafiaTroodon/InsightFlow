# InsightFlow

InsightFlow is a portfolio-ready full-stack business data analysis app. It accepts CSV and Excel uploads, cleans inconsistent business records, stores the cleaned dataset in Neon PostgreSQL, and generates a polished dashboard with charts and rule-based insights.

## Features

- Upload `.csv`, `.xlsx`, and `.xls` files
- Parse CSV rows and Excel first-sheet data into one common JSON shape
- Clean messy business data safely without crashing on bad input
- Remove duplicate rows and standardize flexible column names
- Normalize dates and currency-style values
- Auto-calculate `profit`, `margin`, and over-budget project flags
- Persist datasets and cleaned rows with Prisma + Neon PostgreSQL
- Show summary cards, charts, cleaned table previews, and rule-based insights
- Browse upload history and delete datasets

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Recharts
- Backend: Node.js, Express, Multer
- Database: Neon PostgreSQL
- ORM: Prisma
- File parsing: `csv-parse` and `xlsx`

## Architecture Flow

`Upload → Parse → Clean → Store → Analyze → Visualize`

- Upload: User uploads a CSV or Excel file from the frontend
- Parse: Backend detects file type and converts the first sheet or CSV rows into JSON
- Clean: Backend standardizes columns, fixes missing values, parses dates, and computes metrics
- Store: Dataset metadata and cleaned rows are saved to Neon PostgreSQL with Prisma
- Analyze: Summary metrics, chart series, and rule-based insights are generated
- Visualize: React dashboard renders cards, charts, tables, and insight panels

## Project Structure

```text
root/
  client/
    src/
      components/
      pages/
      api/
      App.jsx
      main.jsx
  server/
    prisma/
      schema.prisma
    src/
      routes/
      services/
      utils/
      index.js
    uploads/
  sample-business-data.csv
  README.md
```

## Environment Variables

Server `.env` example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
PORT=5000
```

Neon PostgreSQL connection strings should be placed in `server/.env` as `DATABASE_URL`.

## Local Setup

### 1. Install dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 2. Configure the database

```bash
cd server
cp .env.example .env
```

Set your Neon connection string in `server/.env`.

### 3. Generate Prisma client and run migrations

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Run the backend

```bash
cd server
npm run dev
```

The API will run on `http://localhost:5000`.

### 5. Run the frontend

```bash
cd client
npm run dev
```

The Vite app will run on `http://localhost:5173`.

## Sample CSV Format

Use the included [`sample-business-data.csv`](./sample-business-data.csv) file or follow this shape:

```csv
project_name,client,revenue,cost,budget,status,date
Project Alpha,Northwind,12450,8200,9000,completed,2026-01-14
Project Beta,Acme Corp,9100,9800,9500,active,02/20/2026
```

Flexible input headers are supported. The backend maps common alternatives like:

- `project`, `project_name`, `name` → `projectName`
- `client`, `client_name`, `customer` → `clientName`
- `revenue`, `invoice_amount`, `amount`, `sales` → `revenue`
- `cost`, `actual_cost`, `expenses` → `cost`
- `budget`, `estimated_budget` → `budget`
- `status`, `state` → `status`
- `date`, `start_date`, `invoice_date` → `date`

## Cleaning Rules

- Convert headers to lowercase `snake_case`
- Remove exact duplicate rows
- Fill missing `revenue` and `cost` with `0`
- Keep missing `budget` as `null`
- Normalize date strings when possible
- Convert money-style values like `$12,450` to numbers
- Calculate `profit = revenue - cost`
- Calculate `margin = profit / revenue`
- Flag over-budget projects when `cost > budget`
- Standardize statuses like `done`, `completed`, and `in progress`
- Return warnings instead of crashing on messy data

## Main Pages

- Home: hero section, CTA, and feature cards
- Upload: drag-and-drop upload, progress state, raw preview, cleaned preview
- Dashboard: summary cards, charts, cleaned data table, insights
- History: list of previous datasets with reopen/delete actions
- Architecture: system pipeline and architecture diagram

## Demo Walkthrough

For a LinkedIn post, portfolio, or interview demo:

1. Open the home page and explain the problem: messy spreadsheet data is hard to analyze quickly.
2. Upload `sample-business-data.csv`.
3. Show the raw preview versus cleaned preview.
4. Open the dashboard and point out the calculated totals, over-budget flags, and charts.
5. Highlight the rule-based insights panel to show how the app turns raw uploads into clear business takeaways.
6. Open the history page to demonstrate persistence and dataset deletion.

## Notes

- No authentication is included
- No paid AI APIs are used
- The app is intentionally small, polished, and demo-focused rather than SaaS-heavy
