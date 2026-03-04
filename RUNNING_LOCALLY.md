# NuvIQ - Running Locally with Firebase Emulators

This guide will help you run the NuvIQ project locally using Firebase Emulators.

## Prerequisites

- **Node.js** installed
- **Firebase CLI** installed globally (`npm install -g firebase-tools`)
- **Java Runtime Environment (JRE)** - Required for Firebase emulators

### Installing Java

Firebase emulators require Java to be installed. Choose one option:

**Option 1: Download from Oracle (Recommended)**

1. Visit https://www.oracle.com/java/technologies/downloads/
2. Download Java 17 or later (LTS version)
3. Run the installer
4. Verify: `java -version` in terminal

**Option 2: Using Package Manager (Windows)**

```bash
# Using Chocolatey
choco install openjdk

# Using winget (Windows 11)
winget install Microsoft.OpenJDK.17
```

**Verify Java Installation:**

```bash
java -version
```

You should see output like: `java version "17.0.x"`

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Your `.env.local` file is already configured with:

- Google AI API key for Genkit
- Firebase emulator configuration

### 3. Start Firebase Emulators

In one terminal, start the Firebase emulators:

```bash
firebase emulators:start
```

This will start:

- **Authentication Emulator**: http://localhost:9099
- **Firestore Emulator**: http://localhost:8081
- **Storage Emulator**: http://localhost:9199
- **Emulator UI**: http://localhost:4000

### 4. Start Next.js Development Server

In another terminal, start the Next.js dev server:

```bash
npm run dev
```

The app will be available at: http://localhost:9002

## Using the Application

### First Time Setup

1. Navigate to http://localhost:9002/signup
2. Create an account with any email/password (no real email needed with emulators)
3. You'll be automatically logged in and redirected to the dashboard

### Uploading Data

1. Click "Upload Dataset" on the dashboard
2. Upload a CSV file with sales data
3. Map the columns to required fields (date, revenue, invoice ID, product name)
4. The system will automatically:
    - Upload the CSV to Firebase Storage
    - Save metadata to Firestore
    - Generate KPIs using Google AI
    - Create sales forecasts
    - Analyze product bundles

### Viewing Data in Emulator UI

1. Open http://localhost:4000
2. Navigate to:
    - **Authentication**: See created users
    - **Firestore**: Browse datasets, forecasts, KPIs
    - **Storage**: View uploaded CSV files

### Data Persistence

The emulators store data in memory by default. To persist data between sessions:

```bash
firebase emulators:start --import=./emulator-data --export-on-exit=./emulator-data
```

## Project Structure

```
src/
├── ai/                    # Genkit AI flows
├── app/                   # Next.js app router
│   ├── (auth)/           # Login/signup pages
│   └── (app)/            # Dashboard (protected)
├── components/           # React components
├── contexts/             # Auth and Dataset contexts
└── lib/
    ├── firebase.ts       # Firebase SDK initialization
    ├── firestore.ts      # Firestore CRUD operations
    └── storage.ts        # Storage upload utilities
```

## Troubleshooting

### Emulator Connection Issues

If you see connection errors, ensure:

1. Firebase emulators are running (`firebase emulators:start`)
2. Ports 9099, 8081, 9199, and 4000 are not in use
3. `.env.local` has `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true`

**Port 8080/8081 already in use:**
If you get "port taken" errors, identify and kill the process:

```bash
# Find process using the port (Windows)
netstat -ano | findstr :8081

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Authentication Errors

- Clear browser localStorage and refresh
- Check Auth emulator UI at http://localhost:4000/auth

### Data Not Persisting

- Emulator data is stored in memory by default
- Use `--export-on-exit` flag to save data between sessions

### localStorage Errors

If you see `localStorage.getItem is not a function` errors:

1. **Clear Next.js build cache:**

    ```bash
    rm -rf .next
    npm run dev
    ```

2. **Clear browser cache** and hard refresh (`Ctrl+Shift+R` or `Cmd+Shift+R`)

## Clean Start

To reset all emulator data:

```bash
rm -rf emulator-data
firebase emulators:start
```

## Next Steps

- Explore the dashboard and upload sample CSV files
- Check the Emulator UI to see data in real-time
- Modify Firestore rules in `firestore.rules`
- Update Storage rules in `storage.rules`



# =============================================================================
# Google AI (Genkit / Gemini)
# =============================================================================
# Get your key at https://aistudio.google.com/app/apikey
GOOGLE_GENAI_API_KEY=
# =============================================================================
# Firebase Project Config (used by the Next.js client)
# Get these values from your Firebase project settings:
# https://console.firebase.google.com → Project Settings → Your apps
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=nuviq-prod-8de69.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nuviq-prod-8de69
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=nuviq-prod-8de69.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=930368721273
NEXT_PUBLIC_FIREBASE_APP_ID=1:930368721273:web:377766a7bd3ffdf28b1fa8

# =============================================================================
# Firebase Emulator Config (set to "true" when running locally with emulators)
# =============================================================================
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8081
NEXT_PUBLIC_FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
