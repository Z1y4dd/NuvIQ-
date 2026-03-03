## Firestore Database Structure

### Collection: `users`

```
users/
  {userId}/                          # Document ID = Firebase Auth UID
    uid: string                      # Firebase Auth UID
    email: string                    # User email
    displayName: string              # User display name
    createdAt: Timestamp             # Account creation date
    updatedAt: Timestamp             # Last update date
```

---

### Collection: `datasets`

```
datasets/
  {datasetId}/                       # Auto-generated document ID
    userId: string                   # Owner's Firebase Auth UID
    name: string                     # Dataset filename
    uploadedAt: Timestamp            # Upload timestamp
    status: string                   # "Pending" | "Processing" | "Completed" | "Failed"
    rowCount: number                 # Number of data rows
    columnCount: number              # Number of columns
    columns: string[]                # Array of column header names

    # Column Mapping (set by user)
    columnMapping: {
      date: string                   # Mapped date column name
      productId: string              # Mapped product ID column name
      productName: string            # Mapped product name column name
      quantity: string               # Mapped quantity column name
      price: string                  # Mapped price column name
      category: string | null        # Mapped category column name (optional)
      customerId: string | null      # Mapped customer ID column name (optional)
    }

    # Raw CSV Data (serialized)
    content: string                  # JSON.stringify(string[][]) — 2D array of rows/cells

    # AI Results (set after processing)
    kpis: {
      totalRevenue: number
      totalOrders: number
      averageOrderValue: number
      topSellingProduct: string
      revenueGrowth: number          # Percentage
      summary: string                # AI-generated summary
    }

    forecast: {
      predictions: [
        {
          date: string               # "YYYY-MM-DD"
          predictedRevenue: number
          lowerBound: number
          upperBound: number
        }
      ]
      trend: string                  # "increasing" | "decreasing" | "stable"
      seasonality: string            # AI-detected seasonality pattern
      summary: string                # AI-generated forecast summary
    }

    bundles: {
      associations: [
        {
          antecedent: string[]       # Products frequently bought together
          consequent: string[]       # Recommended products
          support: number            # 0.0 - 1.0
          confidence: number         # 0.0 - 1.0
          lift: number               # > 1.0 means positive association
        }
      ]
      summary: string                # AI-generated bundles summary
    }

    categories: {
      items: [
        {
          categoryName: string
          totalRevenue: number
          totalUnitsSold: number
          topProduct: string
          growthRate: number         # Percentage
        }
      ]
      summary: string                # AI-generated categories summary
    }
```

---

### Security Rules Summary

| Collection             | Read                              | Write      |
| ---------------------- | --------------------------------- | ---------- |
| `users/{userId}`       | Owner only                        | Owner only |
| `datasets/{datasetId}` | Owner only (`userId == auth.uid`) | Owner only |

---

### Notes

- `content` is stored as a **JSON string** (not a nested array) because Firestore does not support nested arrays.
- All AI result fields (`kpis`, `forecast`, `bundles`) are `undefined` until processing completes.
- `columnMapping` is `undefined` until the user maps columns after upload.
