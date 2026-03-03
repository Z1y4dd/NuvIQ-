# **App Name**: NuvIQ

## Core Features:

- User Authentication: Secure signup, login, and logout functionality using JWT-based sessions.
- CSV/Excel Data Upload and Validation: Upload and validate CSV/Excel files, auto-detect date formats, and map columns. Save validated datasets.
- Time-Series Forecasting: Utilize Prophet or statsmodels ARIMA via a tool that processes uploaded sales data to generate 7, 30, and 90-day sales forecasts, providing confidence intervals.
- Market Basket Analysis: Employ Apriori algorithm to analyze product associations, computing support, confidence, and lift to recommend product bundles.
- Interactive Dashboard: Display sales KPIs, forecast charts, product bundle recommendations, and historical dataset information within a tabbed interface.
- Demo Mode: Provide a demo mode that showcases app functionality without requiring login, using synthetic data and disabling database saving.
- Data Export: Allow users to download analysis results (forecasts, association rules, KPIs) in CSV or JSON formats.

## Style Guidelines:

- Primary color: Deep Indigo (#3F51B5) to convey trust and insight.
- Background color: Light Gray (#F0F2F5), providing a neutral backdrop for data visualization.
- Accent color: Teal (#009688), to highlight key metrics and CTAs.
- Body and headline font: 'Inter', a versatile sans-serif, will provide a modern, machined, objective, neutral look.
- Code font: 'Source Code Pro' for displaying code snippets.
- Consistent use of streamlined icons representing data analytics and forecasting.
- Tabbed interface for easy navigation between dashboards and datasets.
- Smooth transitions and subtle animations for data loading and updates to enhance user experience.