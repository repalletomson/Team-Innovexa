# Finance App 💰

A modern React Native finance management app built with Expo Router and a beautiful green color palette.

## Features

- **Dashboard**: Overview of account balance, income, expenses, and quick actions
- **Transactions**: Detailed transaction history with search and filtering
- **Budget**: Budget tracking with visual progress indicators
- **Authentication**: Login and signup screens with clean UI
- **Bottom Tab Navigation**: Easy navigation between main features

## Color Palette

The app uses a cohesive green theme:
- Primary: #2E7D32 (Dark Green)
- Secondary: #4CAF50 (Medium Green) 
- Accent: #81C784 (Light Green)
- Background: #F1F8E9 (Very Light Green)
- Surface: #FFFFFF (White)

## Project Structure

```
app/
├── (auth)/
│   ├── login.jsx       # Login screen
│   ├── signup.jsx      # Signup screen
│   └── _layout.jsx     # Auth layout
├── (tabs)/
│   ├── index.jsx       # Dashboard (Home)
│   ├── transactions.jsx # Transaction history
│   ├── budget.jsx      # Budget tracking
│   └── _layout.jsx     # Tab navigation layout
└── _layout.jsx         # Root layout

constants/
└── Colors.js           # Centralized color palette
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npx expo start
   ```

3. Open the app in:
   - Expo Go app on your phone
   - iOS Simulator
   - Android Emulator

## Tech Stack

- **React Native** with Expo
- **Expo Router** for navigation
- **JSX** (converted from TypeScript)
- **@expo/vector-icons** for icons
- **React Native Safe Area Context** for safe areas

## Navigation Flow

1. **Authentication**: Users start at login/signup screens
2. **Main App**: After auth, users access the tabbed interface:
   - Dashboard: Account overview and quick actions
   - Transactions: Search and filter transaction history
   - Budget: Track spending against budgets with progress bars

The app features a clean, modern design with intuitive navigation and a consistent green color scheme throughout.