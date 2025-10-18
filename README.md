# AuthorFlow

All-in-one platform for writers. Write, publish, and monetize your work.

## Features

- **Smart Manuscript Editor** - Distraction-free writing with AI assistance
- **Flexible Project Types** - Support for novels, essays, short stories, non-fiction, and more
- **Character & Worldbuilding** - Organize characters, locations, and plot points
- **Publishing Hub** - Schedule and publish to multiple platforms
- **Analytics Dashboard** - Track reads, engagement, and revenue
- **AI Cover Generator** - Generate book covers automatically
- **Community** - Connect with beta readers and get feedback

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL via Supabase
- **Real-time**: Supabase Realtime for live collaboration
- **Auth**: Supabase Auth (email, OAuth)

## Project Structure

```
AuthorFlow/
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   ├── services/      # API services
│   │   └── utils/         # Utilities
│   └── public/
├── backend/           # Node.js/Express backend
│   ├── src/
│   │   ├── index.ts       # Main server
│   │   ├── types.ts       # TypeScript types
│   │   ├── routes/        # API routes
│   │   └── services/      # Business logic
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Setup

1. **Clone or navigate to the project**
   ```bash
   cd AuthorFlow
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   # Fill in your Supabase credentials
   npm install
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   cp .env.example .env.local
   # Fill in your API URL and Supabase credentials
   npm install
   npm run dev
   ```

4. **Access the app**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=postgresql://...
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Run compiled server

## Pricing Tiers

- **Free**: 3 projects, basic editor, 1 platform connection
- **Pro** ($9.99/mo): Unlimited projects, 5 platform connections
- **Plus** ($24.99/mo): Everything in Pro + AI assistant + community

## Roadmap

- [x] Project setup and basic structure
- [ ] Core manuscript editor
- [ ] Character and worldbuilding system
- [ ] Publishing scheduler
- [ ] Analytics dashboard
- [ ] AI-powered cover generator
- [ ] Beta reader management
- [ ] Monetization tracking
- [ ] Community features

## License

MIT

## Author

Riley E. Antrobus

---

For more information, visit [AuthorFlow Website](http://localhost:5173)
