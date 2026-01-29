# Scout9

An automated scouting tool that analyzes official esports match data to generate concise, coach-ready opponent reports highlighting strategies, player tendencies, and composition patterns.

## Features

- Automated analysis of official esports match data
- Coach-ready opponent reports
- Strategy and composition pattern identification
- Player tendency tracking

## Project Structure

```
scout9/
|-- frontend/          # React + Vite + TypeScript frontend
|-- backend/           # FastAPI backend (Supabase Postgres)
|-- .env.example
|-- .env.local
|-- README.md
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Configure `.env.local` at the repo root with your Supabase connection string:
- `SUPABASE_DB_URL` (service role connection string, include `sslmode=require`)

Run the API:

```bash
uvicorn app.main:app --reload
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## License

See [LICENSE](LICENSE) for licensing information.

## Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## Code of Conduct

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community guidelines.

## Roadmap

See [ROADMAP.md](ROADMAP.md) for project roadmap and planned features.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and changes.
