# QR Code Review Generation System

A comprehensive review management platform that helps businesses collect authentic Google reviews through AI-powered QR codes.

## Project Structure

```
the-review-system/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Custom middleware
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   └── app.js          # Main Express app
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # React contexts
│   │   ├── stores/         # Zustand stores
│   │   ├── utils/          # Utility functions
│   │   └── App.jsx         # Main App component
│   └── package.json
│
└── IMPLEMENTATION_PLAN.md  # Detailed implementation plan
```

## Phase 1: Foundation & Project Setup ✅

### Completed Features

#### Backend Setup
- ✅ Node.js/Express server with security middleware
- ✅ Prisma ORM configuration with PostgreSQL
- ✅ Database schema for users, businesses, customers, reviews, QR codes
- ✅ Environment configuration and error handling
- ✅ Health check endpoint with database connectivity
- ✅ Rate limiting and CORS setup

#### Frontend Setup
- ✅ React 18 with Vite build system
- ✅ Tailwind CSS for styling
- ✅ React Router for navigation
- ✅ Zustand state management setup
- ✅ Axios API client with interceptors
- ✅ Authentication context structure
- ✅ Protected route components
- ✅ Basic UI components (Button, Input, LoadingSpinner)
- ✅ Landing page with hero section

## Phase 2: Authentication & User Management ✅

### Completed Features

#### Backend Authentication
- ✅ JWT token generation and validation
- ✅ Password hashing with bcryptjs
- ✅ User registration with validation
- ✅ User login with email/password
- ✅ Token refresh mechanism
- ✅ Role-based access control middleware
- ✅ Password change functionality
- ✅ User profile management
- ✅ Rate limiting for auth endpoints
- ✅ Database seeder with demo accounts

#### Frontend Authentication
- ✅ Complete AuthContext with user state management
- ✅ Login form with validation and error handling
- ✅ Multi-step registration form
- ✅ Protected routes with role checking
- ✅ Automatic token refresh
- ✅ User profile context integration
- ✅ Business information collection during registration

#### Security Features
- ✅ JWT-based stateless authentication
- ✅ Password strength validation
- ✅ Input sanitization and validation
- ✅ Rate limiting on auth endpoints
- ✅ Secure password handling
- ✅ Role-based route protection

### Tech Stack

#### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Headless UI, Heroicons, Lucide React
- **Charts**: Recharts
- **Notifications**: React Hot Toast

#### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **File Storage**: Cloudinary
- **AI**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting
- **Monitoring**: Sentry (production)

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your database URL and other configs
   ```

4. **Database setup**
   ```bash
   npm run db:setup
   # This runs: prisma db push && prisma generate && node prisma/seed.js
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   # Edit .env with your API URL (default: http://localhost:5000)
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   App will run on `http://localhost:3000`

## Authentication System

### Demo Accounts (Available after seeding)
- **Super Admin**: admin@reviewsystem.com / admin123
- **Business Owner 1**: business@example.com / business123  
- **Business Owner 2**: salon@example.com / business123
- **Business Owner 3**: auto@example.com / business123

### Registration Flow
1. **Step 1**: Personal information (name, email, password)
2. **Step 2**: Business information (name, type, contact details)
3. **Automatic login** after successful registration

### Features Available
- ✅ User registration with business info
- ✅ Login with email/password
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ Protected routes
- ✅ User profile management
- ✅ Password change functionality

## API Endpoints

### Authentication Endpoints
- `POST /api/auth/register` - Register new user with business info
- `POST /api/auth/login` - Login with email/password  
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### User Dashboard Endpoints
- `GET /api/user/dashboard` - Get dashboard metrics
- `GET /api/user/businesses` - Get user's businesses
- `GET /api/user/analytics` - Get user analytics

### Health Check
- `GET /health` - Server health status with database connectivity

### API Info
- `GET /api` - API information and available endpoints

## Database Schema

### Core Models
- **User** - Business owners and super admins
- **Business** - Business profiles and settings
- **Customer** - Customer information
- **Review** - Generated reviews and ratings
- **QRCode** - QR code management and analytics
- **SystemAnalytics** - Platform-wide metrics

## Development Workflow

### Phase 2: Authentication & User Management ✅ 
- Complete user registration and login
- JWT token management  
- Role-based access control
- Password reset functionality
- User profile management
- Database seeding with demo accounts

### Phase 3: Business Management System (Next)
- Business profile creation and editing
- Review page customization
- Business settings management

### Upcoming Phases
- Customer review flow
- AI review generation
- QR code management
- Analytics dashboard
- Super admin system
- Production deployment

## Available Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm test` - Run tests

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/review_system_db"
JWT_SECRET=your-jwt-secret
GOOGLE_GEMINI_API_KEY=your-gemini-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=ReviewSystem
VITE_ENV=development
```

## Contributing

1. Follow the implementation plan phases
2. Maintain consistent code style
3. Write tests for new features
4. Update documentation as needed

## License

MIT License - see LICENSE file for details