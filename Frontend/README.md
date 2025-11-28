# Apex Asset Management

A professional, modern landing page for an asset management platform built with React and CSS.

## Features

-  **Landing Page** - Hero section with animated dashboard mockup, features grid, about section, and contact CTA
-  **Authentication** - Professional login and signup pages with form validation
-  **Dark/Light Mode** - Smooth theme toggle with system preference detection
-  **Animations** - Scroll-triggered animations, micro-interactions, and smooth transitions
-  **Responsive** - Fully responsive design for all screen sizes
-  **Modern Design** - Glassmorphism, gradients, and professional corporate styling

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── components/
│   └── Navbar.jsx          # Navigation with theme toggle
├── context/
│   └── ThemeContext.jsx    # Dark/light mode state management
├── pages/
│   ├── LandingPage.jsx     # Main landing page
│   ├── Login.jsx           # Login authentication page
│   └── Signup.jsx          # Signup authentication page
├── styles/
│   ├── index.css           # Global styles & CSS variables
│   ├── App.css             # App layout styles
│   ├── Navbar.css          # Navbar component styles
│   ├── LandingPage.css     # Landing page styles
│   └── Auth.css            # Authentication pages styles
├── App.jsx                 # Main app with routing
└── index.js                # Entry point
```

## Design System

### Colors

- **Primary**: #0066cc (Light) / #3399ff (Dark)
- **Accent**: #00c9a7 (Teal)
- **Success**: #10b981 (Green)
- **Warning**: #f59e0b (Amber)
- **Error**: #ef4444 (Red)

### Typography

- **Display**: Playfair Display
- **Body**: DM Sans

### Theme Toggle

The app supports:
- Manual dark/light toggle
- System preference detection (`prefers-color-scheme`)
- Persistent theme preference (localStorage)

## Tech Stack

- React 18
- React Router DOM 6
- CSS3 (Custom Properties, Flexbox, Grid)
- CSS Animations & Transitions

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)



