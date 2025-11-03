# Tracksy Admin Dashboard

Comprehensive web-based management panel for administrators to monitor and control the entire transport system.

## Developer
**Wahib** (SU92-BSITM-F22-030)

## Tech Stack
- React Router v7 (Remix-style)
- Tailwind CSS
- React Query
- Zustand
- React Hook Form
- Recharts
- Socket.io-client

## Getting Started

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
npm install
```

### Running the App

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Project Structure

```
app/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── charts/       # Chart components
│   ├── tables/       # Table components
│   └── layouts/      # Layout components (Header, Sidebar, Footer)
├── routes/
│   ├── dashboard/    # Dashboard routes
│   ├── buses/        # Bus management routes
│   ├── routes/       # Route management routes
│   ├── users/        # User management routes
│   └── analytics/    # Analytics routes
├── lib/
│   ├── api/          # API client and services
│   ├── utils/        # Utility functions
│   └── constants/    # App constants and config
└── hooks/            # Custom React hooks
```

## Features

- Real-time monitoring of all buses and routes
- Complete user management (students, drivers, admins)
- Route and stop management
- Analytics and reporting dashboard
- Alert and notification management
- System configuration and settings

## Environment Variables

Create a `.env` file in the root directory:

```
API_BASE_URL=http://localhost:8000/api
WS_URL=http://localhost:8000
```

## Phase 1 Status
✅ Project structure created
✅ Dependencies installed
✅ Tailwind CSS configured
✅ API client configured
✅ Socket service configured
✅ Layout components created

## Next Steps
See [WAHIB_TASK_ASSIGNMENT.md](../WAHIB_TASK_ASSIGNMENT.md) for detailed task breakdown.
