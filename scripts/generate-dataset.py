"""
NuvIQ Sample Dataset Generator
Generates a realistic retail sales CSV perfectly matched to NuvIQ's column mapping.

Required columns:  date, total revenue, product name
Optional columns:  invoiceid, quantity, customer id, category

Usage:
    python generate-dataset.py
    python generate-dataset.py --rows 2000 --output my_sales.csv --start 2024-01-01 --end 2024-12-31
"""

import csv
import random
import argparse
from datetime import datetime, timedelta

# ── Configurable product catalog ──────────────────────────────────────────────
PRODUCTS = {
    "Electronics": [
        ("Wireless Earbuds Pro", 49.99),
        ("USB-C Hub 7-in-1", 34.99),
        ("Portable Charger 20000mAh", 29.99),
        ("Mechanical Keyboard TKL", 89.99),
        ("Webcam 1080p HD", 59.99),
        ("LED Desk Lamp Smart", 44.99),
        ("Smart Plug WiFi", 19.99),
        ("Bluetooth Speaker Mini", 39.99),
    ],
    "Office Supplies": [
        ("Sticky Notes Pack 12", 8.99),
        ("Ballpoint Pens 50pk", 12.49),
        ("A4 Printer Paper 500sh", 9.99),
        ("Desk Organizer Bamboo", 24.99),
        ("Stapler Heavy Duty", 16.99),
        ("Whiteboard Markers 8pk", 11.49),
        ("File Folders 100pk", 18.99),
        ("Scissors Stainless Steel", 7.49),
    ],
    "Clothing": [
        ("Classic Cotton T-Shirt", 19.99),
        ("Slim Fit Chinos", 49.99),
        ("Hooded Sweatshirt", 44.99),
        ("Running Socks 6pk", 14.99),
        ("Canvas Sneakers", 59.99),
        ("Wool Beanie Hat", 17.99),
        ("Zip-Up Fleece Jacket", 74.99),
        ("Sport Shorts", 24.99),
    ],
    "Home & Kitchen": [
        ("Ceramic Coffee Mug", 12.99),
        ("Non-Stick Frying Pan 28cm", 34.99),
        ("Bamboo Cutting Board", 21.99),
        ("Glass Storage Containers 5pk", 27.99),
        ("Digital Kitchen Scale", 18.99),
        ("French Press Coffee Maker", 29.99),
        ("Silicone Spatula Set 3pk", 9.99),
        ("Stainless Steel Water Bottle", 22.99),
    ],
    "Beauty & Health": [
        ("Vitamin C Serum 30ml", 24.99),
        ("Natural Face Moisturizer", 19.99),
        ("Bamboo Toothbrush 4pk", 8.99),
        ("Facial Sunscreen SPF50", 16.99),
        ("Vitamin D3 Supplements", 13.99),
        ("Reusable Cotton Pads 20pk", 11.49),
        ("Lip Balm SPF15 3pk", 7.99),
        ("Essential Oil Diffuser", 32.99),
    ],
}

# Flatten for easy lookup
ALL_PRODUCTS = [(name, price, cat) for cat, items in PRODUCTS.items() for name, price in items]


def random_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))


def generate_dataset(
    num_rows: int,
    start_date: datetime,
    end_date: datetime,
    num_customers: int = 500,
    seasonality: bool = True,
) -> list[dict]:
    """Generate realistic retail transactions with weekly + seasonal patterns."""
    rows = []
    invoice_counter = 10000
    customer_ids = [f"CUST{str(i).zfill(4)}" for i in range(1, num_customers + 1)]

    for _ in range(num_rows):
        tx_date = random_date(start_date, end_date)

        # Apply a mild seasonal uplift (higher sales Nov–Dec)
        if seasonality and tx_date.month in (11, 12):
            if random.random() < 0.3:
                # Re-roll into Nov/Dec to simulate holiday spike
                tx_date = random_date(
                    datetime(tx_date.year, 11, 1),
                    datetime(tx_date.year, 12, 31),
                )

        product_name, unit_price, category = random.choice(ALL_PRODUCTS)
        qty = random.choices([1, 2, 3, 4, 5, 10], weights=[50, 25, 12, 7, 4, 2])[0]

        # Small random price variance (±10%)
        actual_price = round(unit_price * random.uniform(0.90, 1.10), 2)
        total_revenue = round(actual_price * qty, 2)

        rows.append({
            "invoiceid": f"INV{invoice_counter + _}",
            "date": tx_date.strftime("%Y-%m-%d"),
            "product name": product_name,
            "category": category,
            "quantity": qty,
            "total revenue": total_revenue,
            "customer id": random.choice(customer_ids),
        })

    # Sort by date ascending (more realistic)
    rows.sort(key=lambda r: r["date"])
    return rows


def main():
    parser = argparse.ArgumentParser(description="Generate a NuvIQ-compatible sales CSV.")
    parser.add_argument("--rows",   type=int,   default=1000,           help="Number of transaction rows (default: 1000)")
    parser.add_argument("--output", type=str,   default="sample_sales.csv", help="Output CSV filename")
    parser.add_argument("--start",  type=str,   default="2024-01-01",   help="Start date YYYY-MM-DD")
    parser.add_argument("--end",    type=str,   default="2024-12-31",   help="End date YYYY-MM-DD")
    parser.add_argument("--customers", type=int, default=500,           help="Number of unique customers")
    parser.add_argument("--no-seasonality", action="store_true",        help="Disable holiday seasonal uplift")
    args = parser.parse_args()

    start_dt = datetime.strptime(args.start, "%Y-%m-%d")
    end_dt   = datetime.strptime(args.end,   "%Y-%m-%d")

    if end_dt <= start_dt:
        print("ERROR: --end must be after --start")
        return

    print(f"Generating {args.rows} rows from {args.start} to {args.end}...")
    data = generate_dataset(
        num_rows=args.rows,
        start_date=start_dt,
        end_date=end_dt,
        num_customers=args.customers,
        seasonality=not args.no_seasonality,
    )

    fieldnames = ["invoiceid", "date", "product name", "category", "quantity", "total revenue", "customer id"]

    output_path = args.output
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(data)

    # Summary
    total_rev = sum(r["total revenue"] for r in data)
    unique_customers = len({r["customer id"] for r in data})
    unique_products  = len({r["product name"] for r in data})
    categories       = len({r["category"] for r in data})

    print(f"\n✅ Dataset saved to: {output_path}")
    print(f"   Rows:             {len(data):,}")
    print(f"   Date range:       {data[0]['date']} → {data[-1]['date']}")
    print(f"   Total revenue:    ${total_rev:,.2f}")
    print(f"   Unique customers: {unique_customers}")
    print(f"   Unique products:  {unique_products}")
    print(f"   Categories:       {categories}")
    print(f"\nColumn headers in CSV:")
    for col in fieldnames:
        print(f"   • {col}")
    print("\nUpload this CSV to NuvIQ — all columns will auto-map on the mapping screen.")


if __name__ == "__main__":
    main()
