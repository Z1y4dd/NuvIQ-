

GitHub Copilot: ## Features Overview

### 🤖 AI-Powered Features
These call the Genkit/Gemini API during dataset processing:

| Feature | Location | What AI Does |
|---|---|---|
| **KPI Analysis** | Overview tab | Generates `totalRevenue`, `totalOrders`, `avgOrderValue`, `topSellingProduct`, `revenueGrowth`, and a natural language `summary` |
| **Time Series Forecast** | Forecast tab | Predicts future revenue with `lowerBound`/`upperBound` confidence intervals, detects `trend` and `seasonality` |
| **Product Bundle Recommendations** | Product Bundles tab | Runs market basket analysis, returns `support`, `confidence`, `lift` scores and bundle suggestions |

---

### ⚙️ Non-AI Features
These work without any AI calls:

| Feature | What It Does |
|---|---|
| **Authentication** | Firebase Auth — login, register, session management |
| **Dataset Upload** | CSV parsing, column detection, row/column counting |
| **Column Mapping** | User manually maps CSV columns to required fields |
| **Uploads Table** | Lists all datasets with status, row count, timestamps |
| **Dataset Detail Page** | Shows raw CSV data in a table (`/dashboard/datasets/[id]`) |
| **Firestore Storage** | Saving/reading datasets, users, and AI results |
| **Real-time Updates** | Firestore `onSnapshot` listener keeps UI in sync |
| **Toast Notifications** | Success/error feedback during upload and processing |

---

### Flow Summary

```
Upload CSV → Parse (no AI) → Map Columns (no AI) → Process:
    ├── Generate KPIs        ← AI
    ├── Generate Forecast    ← AI
    └── Generate Bundles     ← AI
         ↓
    Save to Firestore (no AI) → Display Results (no AI)
```
