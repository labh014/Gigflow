# Gigflow

A high-performance, secure, and production-ready backend for a freelance marketplace. Built with Express, MongoDB, and Socket.io.

## Features

### 1. Security First 
- **HttpOnly Cookies**: JWTs are stored securely in cookies, not LocalStorage, preventing XSS attacks.
- **Strict Authorization**: Middleware ensures users can only access what they own.

### 2. Business Logic 
- **Gig Lifecycle**: Users can create gigs. Gigs have states (`open` -> `assigned`).
- **Bidding Rules**:
  - Freelancers can bid on open gigs.
  - **Self-Bidding Prevention**: Users cannot bid on their own gigs.
  - **Privacy**: Only the gig owner can view the bids received.

### 3. Advanced Hiring Engine 
- **Atomic Transactions**: Uses MongoDB Sessions to prevent race conditions. If two users click "Hire" simultaneously, only one succeeds.
- **Smart State Management**: When a freelancer is hired, all other bids are automatically rejected.
- **Real-Time Events**: Integrates `Socket.io` to notify freelancers instantly when they are hired.


## API Flow

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login & receive HttpOnly cookie

### Gigs (Client Side)
- `POST /api/gigs` - Post a new job (Status: `open`)
- `GET /api/gigs?search=web` - Search for open jobs

### Bidding (Freelancer Side)
- `POST /api/bids` - Place a bid on a gig
- `GET /api/bids/:gigId` - View bids (Owner only)

### Hiring (The "Deal")
- `PATCH /api/bids/:bidId/hire` - Atomically hire a freelancer.
  - **Effect**: Gig -> `assigned`, Bid -> `hired`, Other Bids -> `rejected`.
  - **Event**: Emits `hired` socket event to freelancer.

## How to Run

1. **Install Dependencies**

   npm install

2. **Setup Environment**
   - Configure `.env` with `MONGO_URI`, `JWT_SECRET`, etc.
   
3. **Start Server**
   
   npm run dev

