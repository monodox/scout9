# Scout9 Frontend

React + Vite + TypeScript frontend for Scout9 esports scouting tool.

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide React (icons)

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── auth/           # Authentication pages
│   │   │   ├── login/
│   │   │   ├── signup/
│   │   │   ├── forgot-password/
│   │   │   ├── verify-email/
│   │   │   ├── reset-password/
│   │   │   └── layout.tsx
│   │   ├── console/        # Console pages
│   │   │   ├── dashboard/
│   │   │   ├── scout/
│   │   │   ├── report/
│   │   │   ├── players/
│   │   │   ├── strategies/
│   │   │   ├── compositions/
│   │   │   ├── settings/
│   │   │   ├── system/
│   │   │   ├── support/
│   │   │   └── layout.tsx
│   │   └── legal/          # Legal pages
│   │       ├── terms/
│   │       ├── privacy/
│   │       ├── cookies/
│   │       └── layout.tsx
│   ├── components/
│   │   ├── app/            # App components
│   │   │   ├── app-header.tsx
│   │   │   └── app-footer.tsx
│   │   ├── console/        # Console components
│   │   │   ├── console-sidebar.tsx
│   │   │   └── console-header.tsx
│   │   └── ui/             # UI components
│   ├── lib/
│   │   └── utils.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
└── package.json
```

## Available Routes

### Authentication
- `/login` - Login page
- `/signup` - Sign up page
- `/forgot-password` - Forgot password
- `/verify-email` - Email verification
- `/reset-password` - Password reset

### Console
- `/console/dashboard` - Dashboard
- `/console/scout` - Scout analysis
- `/console/report` - Reports
- `/console/players` - Player tracking
- `/console/strategies` - Strategy analysis
- `/console/compositions` - Composition analysis
- `/console/settings` - Settings
- `/console/system` - System status
- `/console/support` - Support

### Legal
- `/legal/terms` - Terms of Service
- `/legal/privacy` - Privacy Policy
- `/legal/cookies` - Cookie Policy

### Other
- `/` - Home

## API Integration

### Backend Routes

| Frontend Page | Backend API Route |
|--------------|-------------------|
| Dashboard | `GET /api/system/overview` |
| Scout | `POST /api/scout/run` |
| Report | `GET /api/report/{id}` |
| Players | `GET /api/players/{id}` |
| Strategies | `GET /api/strategies/{id}` |
| Compositions | `GET /api/compositions/{id}` |
| Settings | `GET/PUT /api/settings` |
| System | `GET /api/system/status` |
| Support | `POST /api/support` |

Backend API base URL: `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.
