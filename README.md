# AI Budget Manager

A full-stack mobile budget tracking application with AI-powered transaction parsing, built with React Native (Expo), Node.js, Firebase, and the Anthropic Claude API.

---

## Overview

AI Budget Manager allows users to log expenses in natural Hebrew using free-text input. The app uses a multi-agent AI pipeline to classify, parse, and analyze transactions — eliminating the need for manual form entry. Users can share a workspace with a partner to track shared finances.

---

## Live Demo

- **Backend:** Deployed on [Railway](https://railway.app)
- **Frontend:** Published via Expo EAS — scan with [Expo Go](https://expo.dev/go) to run on iOS or Android
- **Android APK:** Available in [Releases](https://github.com/Rasha942/budget-ai/releases)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native, Expo |
| Backend | Node.js, Express |
| Database | Firebase Firestore |
| Authentication | Firebase Auth (Email/Password + Google OAuth) |
| AI | Anthropic Claude API (claude-sonnet-4-6) |
| Deployment | Railway (backend), Expo EAS (mobile) |

---

## Features

### Core
- **AI-powered transaction entry** — type freely in Hebrew (e.g. "קפה 45 שקל") and the AI parses, categorizes, and saves the transaction
- **Conversational finance queries** — ask questions like "כמה הוצאתי על אוכל החודש?" and get AI-generated answers from your transaction history
- **Anomaly detection** — the AI flags unusual spending based on your history
- **Dynamic placeholders** — the input field generates contextual Hebrew prompts using the AI

### Authentication
- Email/Password registration with username
- Google Sign-In (web and Android)
- Firebase ID token authentication with automatic refresh
- Account deletion (removes all user data, workspaces, and transactions)

### Workspaces
- Create or join shared workspaces via invite codes (24-hour expiry, auto-regenerates)
- Multiple workspaces per user with instant switching
- Invite code sharing via native share sheet

### Transaction Management
- Full CRUD — add, edit, delete transactions
- Inline edit form per transaction card
- Confirm before delete (native Alert on mobile, window.confirm on web)
- `addedBy` field tracks which user added each transaction

### History
- Transactions grouped by month with Hebrew month headers
- Auto-refreshes when switching tabs or workspaces

### Summary & Export
- Date range filter with native date picker (iOS/Android)
- Category breakdown with pie chart and bar chart
- Export to `.xlsx` (Excel) — generates on server, downloads to device via native share sheet
- Two-sheet export: full transaction list + category summary

---

## Architecture

```
React Native App
       │
       ▼
Express Server (Railway)
       │
       ├── Anthropic Claude API  ←  orchestrator, parser, analyzer, anomaly detector
       └── Firebase Firestore    ←  users, workspaces, transactions
```

### AI Pipeline (`agents.js`)

The app uses a 4-agent pipeline:

1. **Orchestrator** — classifies user input as "save transaction" or "answer question"
2. **Parser** — extracts structured transaction data (amount, category, date, description) from free text
3. **Analyzer** — answers natural language questions about spending history
4. **Anomaly Detector** — compares new transactions against historical patterns and flags outliers

---

## Known Limitations

| Issue | Details |
|---|---|
| Google Sign-In on iOS | Requires an Apple Developer account ($99/year) for native OAuth. Currently only available via email/password on iOS. |
| Google Sign-In on Android | Works in production APK builds. Not supported in Expo Go on Android. |
| EAS Updates | Over-the-air JS updates require the `channel` field in `eas.json` to be configured correctly. |
| Date Picker styling | `themeVariant` and `display="compact"` props for `@react-native-community/datetimepicker` are not fully supported in Expo Go — will render correctly in production builds. |
| Token expiry | Firebase ID tokens expire after 1 hour. The app refreshes tokens when brought to foreground via `AppState`. Sessions older than 1 hour without foreground activity may require re-login. |

---

## Future Features

- [ ] **Income tracking** — add transaction type (expense/income) with net balance in summary
- [ ] **Recurring transactions** — set up monthly/weekly recurring expenses that auto-register on app open
- [ ] **Google Sheets export** — export directly to a shared Google Sheet
- [ ] **Date filter in History** — jump to a specific time period
- [ ] **Push notifications** — reminders to log expenses
- [ ] **Currency support** — multi-currency transactions with conversion
- [ ] **Budget goals** — set monthly limits per category with alerts
- [ ] **Google Sign-In on iOS** — requires Apple Developer account

---

## Project Structure

```
budget-ai/
├── screens/
│   ├── HomeScreen.js          # Main input screen with AI pipeline
│   ├── HistoryScreen.js       # Transaction history grouped by month
│   ├── SummaryScreen.js       # Charts, date filter, Excel export
│   ├── WorkspaceScreen.js     # Workspace management, invite codes
│   ├── WorkspaceSetupScreen.js
│   ├── LoginScreen.js         # Google + Email/Password auth
│   └── SetPasswordScreen.js   # Google users set a password for cross-platform login
├── services/
│   ├── agents.js              # AI pipeline (orchestrator, parser, analyzer, anomaly)
│   ├── Transactions.js        # Firestore CRUD for transactions
│   ├── workspace.js           # Workspace logic (create, join, delete, invite)
│   ├── firebase.js            # Firestore client
│   ├── firebaseAdmin.js       # Firebase Admin SDK
│   └── authMiddleware.js      # JWT verification
├── auth.js                    # Firebase Auth (Google + Email/Password)
├── utils.js                   # Date helpers, groupByMonth, filterByDateRange
├── server.js                  # Express API
├── App.js                     # Root component, navigation, session management
├── app.json                   # Expo config
├── eas.json                   # EAS Build config
└── google-services.json       # Firebase Android config
```

---

## Design Decisions

### Why Hebrew?

**Market gap** — the English-language personal finance app market is saturated with well-funded competitors (Mint, YNAB, Copilot, etc.). The Hebrew-language personal finance space is significantly underdeveloped compared to English. Rather than competing with larger teams and bigger budgets, this app targets an underserved market.

**Accessibility** — natural language input in your native language significantly lowers the barrier to financial tracking. Finance apps are often intimidating; removing the language friction makes the product more approachable for users who are not comfortable with English-language interfaces.

**Technical interest** — parsing Hebrew free-text input presents a genuinely harder NLP problem than English. Hebrew is RTL, uses informal abbreviations (שקל, ₪, ש״ח), and does not always separate words clearly in casual writing. Building an AI pipeline that handles this robustly is a more interesting engineering challenge.

---

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g eas-cli`)
- Firebase project with Firestore and Authentication enabled
- Anthropic API key

### Environment Variables (Railway / `.env`)

```
ANTHROPIC_API_KEY=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_ADMIN_CREDENTIALS=   # JSON stringified service account
```

### Running locally

```bash
# Install dependencies
npm install

# Start backend
npm start

# Start Expo (frontend)
npx expo start --go
```

### Building Android APK

```bash
eas build --platform android --profile preview
```

---

## Author

Raz Sharaby — [GitHub](https://github.com/Rasha942)
