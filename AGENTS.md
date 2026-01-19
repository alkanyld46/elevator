# AGENTS.md - Elevator Maintenance App

Guidelines for AI coding agents working in this repository.

## Project Overview

A full-stack elevator maintenance tracking application:
- **Client**: React 19 SPA (Create React App) with role-based auth (admin/tech)
- **Server**: Express 5 REST API with MongoDB (Mongoose ODM)
- **Auth**: JWT-based with bcrypt password hashing

## Repository Structure

```
elevator-app/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components (.jsx)
│   │   ├── pages/       # Route-level page components (.jsx)
│   │   ├── utils/       # Utilities like api.js
│   │   ├── App.js       # Main router setup
│   │   └── auth.js      # AuthContext provider
│   └── package.json
├── server/              # Express backend
│   ├── config/          # DB connection (db.js)
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   ├── uploads/         # File uploads (gitignored)
│   ├── server.js        # App entry point
│   └── package.json
└── .gitignore
```

## Build / Run Commands

### Server (Express API)

```bash
cd server
npm install              # Install dependencies
npm run dev              # Development with nodemon (auto-reload)
npm start                # Production mode
```

### Client (React)

```bash
cd client
npm install              # Install dependencies
npm start                # Development server (port 3000)
npm run build            # Production build
npm test                 # Run all tests (Jest + React Testing Library)
npm test -- --watchAll=false   # Run tests once (CI mode)
npm test -- MyComponent  # Run single test file by name pattern
```

### Running a Single Test

```bash
cd client
npm test -- --testPathPattern="App.test"      # Match by file path
npm test -- --testNamePattern="renders"       # Match by test name
npm test -- App.test.js --watchAll=false      # Exact file, no watch
```

## Code Style Guidelines

### JavaScript / ES6+

- Use ES6+ features: arrow functions, destructuring, template literals
- Use `const` by default, `let` when reassignment is needed, never `var`
- Prefer async/await over raw Promises
- Use optional chaining (`?.`) and nullish coalescing (`??`)

### Imports (Order)

1. Node built-ins / external packages
2. Relative imports (components, utils, etc.)
3. CSS imports last

```javascript
// Server example
const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Client example
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import './Component.css'
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (React components) | PascalCase.jsx | `Dashboard.jsx` |
| Files (utilities/config) | camelCase.js | `api.js`, `db.js` |
| React components | PascalCase | `function Dashboard()` |
| Functions | camelCase | `getAll`, `startScanner` |
| Variables | camelCase | `selectedTech`, `monthDate` |
| Constants (env vars) | SCREAMING_SNAKE | `JWT_SECRET`, `PORT` |
| Mongoose models | PascalCase singular | `User`, `Elevator` |
| Route files | camelCase + "Routes" | `authRoutes.js` |
| Controller files | camelCase + "Controller" | `authController.js` |

### React Patterns

- Functional components only (no class components)
- Use hooks: `useState`, `useEffect`, `useContext`, `useRef`, `useMemo`
- Export components as default: `export default function ComponentName()`
- Use controlled inputs with `useState`
- JSX uses `.jsx` extension; plain JS uses `.js`

```jsx
export default function Login() {
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  
  const submit = async e => {
    e.preventDefault()
    // ...
  }
  
  return <form onSubmit={submit}>...</form>
}
```

### Express / Backend Patterns

- Controllers export individual functions: `exports.functionName = async (req, res) => {}`
- Document routes with JSDoc-style comments: `// @route POST /api/auth/login`
- Use `router.use(protect)` for route-wide auth middleware
- Use `authorize('admin')` for role-based access

```javascript
// Route definition pattern
router.use(protect)
router.get('/', getAll)
router.post('/', authorize('admin'), create)
```

### Error Handling

**Server-side:**
- Return appropriate HTTP status codes (400, 401, 403, 404, 500)
- Return JSON with `msg` field: `res.status(400).json({ msg: 'Error message' })`
- Use try/catch for async operations, log with `console.error`

```javascript
exports.create = async (req, res) => {
  try {
    const item = await Model.create(req.body)
    res.status(201).json(item)
  } catch (err) {
    console.error('Create Error:', err)
    res.status(500).json({ msg: 'Server error', error: err.message })
  }
}
```

**Client-side:**
- Handle errors in catch blocks with `err.response?.data?.msg`
- Display user-friendly error messages via state

### Mongoose Models

- Use schema options: `{ timestamps: true }` for createdAt/updatedAt
- Define validation in schema: `{ type: String, required: true }`
- Export as: `module.exports = mongoose.model('ModelName', schema)`

### API Client (Axios)

Located at `client/src/utils/api.js`:
- Base URL from `REACT_APP_API_URL` env var
- Auto-attaches JWT token from localStorage
- Redirects to `/login` on 401 responses

```javascript
import api from '../utils/api'
const { data } = await api.get('/elevators')
await api.post('/records', { elevatorId })
```

### Authentication Flow

- Token stored in `localStorage.getItem('token')`
- User object in `localStorage.getItem('user')`
- Auth context provides `{ token, user, setAuth }`
- Two roles: `admin` and `tech`

### Styling

- Bootstrap classes for layout and components
- Inline styles for quick customizations
- Component-specific CSS files when needed (e.g., `Scanner.css`)

## Environment Variables

**Server (.env):**
```
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
```

**Client (.env):**
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Common Tasks

### Add a New API Endpoint

1. Create/update model in `server/models/`
2. Add controller function in `server/controllers/`
3. Add route in `server/routes/`
4. Mount route in `server/server.js` if new file

### Add a New Page

1. Create component in `client/src/pages/ComponentName.jsx`
2. Add route in `client/src/App.js`
3. Wrap with `<RequireAuth roles={['admin']} />` if protected

## Do Not Commit

- `.env` files (secrets)
- `node_modules/`
- `uploads/` directory
- Build artifacts (`client/build/`)
