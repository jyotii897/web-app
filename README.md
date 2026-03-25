# 🚀 PlanIt.AI - Premium Task Tracker

A full-stackTask Tracker Web App built with the MERN stack, featuring JWT authentication, real-time analytics, and a premium glassmorphism dashboard.

## 🛠️ Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Security**: JWT, Bcrypt, Helmet, CORS.

## 📦 Setup Steps

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```
4. `npm start` (or `npm run dev` with nodemon)

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user.
- `POST /api/auth/login` - Authenticate user & get JWT.

### Task Management (Protected - Requires JWT)
- `GET /api/tasks` - List all tasks (supports pagination, search, status/priority filtering).
- `POST /api/tasks` - Create a new task.
- `PUT /api/tasks/:id` - Update an existing task.
- `DELETE /api/tasks/:id` - Delete a task.
- `GET /api/tasks/stats` - Get analytics (Total, Completed, Pending, Percentage).

## 🎨 Design Decisions
- **Premium UI**: Used a "Glassmorphism" theme to give a modern, high-end SAAS feel.
- **Micro-interactions**: Subtle hover translations and scaling for buttons.
- **Accessibility**: Support for both **Dark Mode** and **Light Mode**.
- **Performance**: Optimized MongoDB queries with indexing on title and description.
- **Validation**: Strict server-side validation using `express-validator` to ensure data integrity.
- **State Management**: Used React Context API for global authentication state.

## 📈 Analytics Support
The app calculates real-time insights:
- **Total Tasks**: Overall task count.
- **Completion Rate**: Dynamic percentage based on "Done" status.
- **Pending/Completed**: Breakdown of current workload.
