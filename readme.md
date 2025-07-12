# SkillSwap Platform

A modern skill exchange platform built with Next.js, TypeScript, and MongoDB where users can offer their skills and learn from others.

## Team Information

- **Team Name**: The Boom
- **Team Leader**: ashutoshmishra1615@gmail.com

## Features

### 🏠 Home Page

- Landing page with platform overview
- Feature highlights and statistics
- Call-to-action for new users

### 👤 User Profile Page

- View and edit personal information
- Manage offered and wanted skills
- Display user ratings and bio

### 🔐 Authentication

- Google OAuth integration
- Secure session management
- Custom sign-in page

### 🔄 Swap Requests Page

- Browse available skill swap requests
- Create new swap requests
- Search and filter functionality
- Accept/reject requests

### ⭐ Ratings & Feedback Page

- Rate completed skill swaps
- View community ratings
- Provide detailed feedback

### 📋 Detailed Request Page

- View complete swap request details
- See offered and wanted skills
- User profile information
- Accept/decline with messages

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: NextAuth.js with Google OAuth
- **Database**: MongoDB with Mongoose
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- MongoDB database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd skill_swap
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env.local` file with:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MONGODB_URI=mongodb+srv://user:dipankar2006@skillswap.nzva4pi.mongodb.net/?retryWrites=true&w=majority&appName=skillswap
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── profile/       # User profile API
│   │   ├── ratings/       # Ratings API
│   │   └── swap-requests/ # Swap requests API
│   ├── auth/              # Authentication pages
│   ├── profile/           # User profile page
│   ├── ratings/           # Ratings page
│   ├── swap-requests/     # Swap requests pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── layout/           # Layout components
├── lib/                  # Utility functions
├── models/               # MongoDB models
└── types/                # TypeScript type definitions
```

## API Endpoints

### Authentication

- `GET/POST /api/auth/[...nextauth]` - NextAuth.js endpoints

### User Profile

- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update user profile

### Swap Requests

- `GET /api/swap-requests` - Get all pending requests
- `POST /api/swap-requests` - Create new request
- `GET /api/swap-requests/[id]` - Get specific request
- `PUT /api/swap-requests/[id]/accept` - Accept request
- `PUT /api/swap-requests/[id]/reject` - Reject request
- `GET /api/swap-requests/completed` - Get completed swaps

### Ratings

- `GET /api/ratings` - Get all ratings
- `POST /api/ratings` - Create new rating

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of a team assignment for skill swap platform development.
