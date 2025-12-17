# TaskFlow - Real-Time Task Management Application

A full-stack task management application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring real-time collaboration using Socket.io.

![TaskFlow](https://img.shields.io/badge/TaskFlow-v1.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248)
![Socket.io](https://img.shields.io/badge/Socket.io-4.7-black)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Backend Architecture](#-backend-architecture)
- [Real-Time Features](#-real-time-features)
- [Frontend Overview](#-frontend-overview)

---

## ✨ Features

### Core Features

- **User Authentication** - Register, login, logout with JWT-based authentication
- **Task Management** - Create, read, update, and delete tasks
- **Task Assignment** - Assign tasks to team members
- **Task Status Tracking** - Track tasks through To Do → In Progress → Review → Completed
- **Priority Levels** - Low, Medium, High, Urgent priorities
- **Due Date Management** - Set and track task deadlines

### Real-Time Collaboration

- **Live Updates** - See task changes instantly across all connected clients
- **Assignment Notifications** - Receive instant notifications when assigned to a task
- **Online User Tracking** - See who's currently online
- **Browser Notifications** - Get desktop notifications for important events

### Dashboard

- **Task Statistics** - Overview of total, in-progress, and urgent tasks
- **Recent Activity** - Track recent task actions
- **Upcoming Deadlines** - View tasks due soon
- **Overdue Tasks** - Monitor tasks past their due date

---

## 🛠 Tech Stack

### Backend

| Technology     | Purpose                 |
| -------------- | ----------------------- |
| **Node.js**    | Runtime environment     |
| **Express.js** | Web framework           |
| **TypeScript** | Type-safe JavaScript    |
| **MongoDB**    | NoSQL database          |
| **Mongoose**   | MongoDB ODM             |
| **Socket.io**  | Real-time communication |
| **JWT**        | Authentication tokens   |
| **Bcrypt.js**  | Password hashing        |
| **Zod**        | Request validation      |

### Frontend

| Technology           | Purpose                 |
| -------------------- | ----------------------- |
| **React 18**         | UI library              |
| **TypeScript**       | Type-safe JavaScript    |
| **Vite**             | Build tool              |
| **TailwindCSS**      | Styling                 |
| **Radix UI**         | Accessible components   |
| **React Query**      | Server state management |
| **Socket.io Client** | Real-time connection    |
| **React Router**     | Client-side routing     |
| **React Hook Form**  | Form handling           |
| **Sonner**           | Toast notifications     |

---

## 📁 Project Structure

```
Task-management-app/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts      # MongoDB connection
│   │   │   └── socket.ts        # Socket.io configuration
│   │   ├── controllers/
│   │   │   ├── AuthController.ts
│   │   │   ├── TaskController.ts
│   │   │   ├── DashboardController.ts
│   │   │   └── notificationController.ts
│   │   ├── dtos/
│   │   │   ├── auth.dto.ts      # Auth validation schemas
│   │   │   └── task.dto.ts      # Task validation schemas
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validation.middleware.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Task.ts
│   │   │   └── Notification.ts
│   │   ├── repositories/
│   │   │   ├── UserRepository.ts
│   │   │   └── TaskRepository.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── task.routes.ts
│   │   │   ├── dashboard.routes.ts
│   │   │   └── notification.routes.ts
│   │   ├── services/
│   │   │   ├── AuthService.ts
│   │   │   ├── TaskService.ts
│   │   │   └── NotificationService.ts
│   │   ├── types/
│   │   │   └── types.ts         # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── errors.ts        # Custom error classes
│   │   │   ├── jwt.ts           # JWT utilities
│   │   │   └── socketEmitters.ts
│   │   └── server.ts            # Entry point
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── layout/
│   │   │   ├── notifications/
│   │   │   ├── tasks/
│   │   │   └── ui/              # Reusable UI components
│   │   ├── contexts/
│   │   │   ├── auth-context.tsx
│   │   │   └── socket-context.tsx
│   │   ├── hooks/
│   │   │   ├── use-queries.ts   # React Query hooks
│   │   │   └── use-realtime.ts
│   │   ├── lib/
│   │   │   ├── api.ts           # API client
│   │   │   ├── types.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── dashboard.tsx
│   │   │   ├── tasks.tsx
│   │   │   └── settings.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Task-management-app
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables** (see below)

5. **Start the development servers**

   Backend:

   ```bash
   cd backend
   npm run dev
   ```

   Frontend:

   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

---

## 🔐 Environment Variables

### Backend (.env)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/taskflow

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:5173
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint             | Description       | Auth Required |
| ------ | -------------------- | ----------------- | ------------- |
| POST   | `/api/auth/register` | Register new user | No            |
| POST   | `/api/auth/login`    | Login user        | No            |
| POST   | `/api/auth/logout`   | Logout user       | No            |
| GET    | `/api/auth/profile`  | Get current user  | Yes           |
| PUT    | `/api/auth/profile`  | Update profile    | Yes           |
| GET    | `/api/auth/users`    | Get all users     | Yes           |

### Task Endpoints

| Method | Endpoint                | Description        | Auth Required      |
| ------ | ----------------------- | ------------------ | ------------------ |
| POST   | `/api/tasks`            | Create new task    | Yes                |
| GET    | `/api/tasks`            | Get user's tasks   | Yes                |
| GET    | `/api/tasks/:id`        | Get task by ID     | Yes                |
| PATCH  | `/api/tasks/:id`        | Update task        | Yes                |
| PATCH  | `/api/tasks/:id/status` | Update task status | Yes                |
| DELETE | `/api/tasks/:id`        | Delete task        | Yes (Creator only) |

### Dashboard Endpoints

| Method | Endpoint                   | Description            | Auth Required |
| ------ | -------------------------- | ---------------------- | ------------- |
| GET    | `/api/dashboard/stats`     | Get task statistics    | Yes           |
| GET    | `/api/dashboard/activity`  | Get recent activity    | Yes           |
| GET    | `/api/dashboard/deadlines` | Get upcoming deadlines | Yes           |
| GET    | `/api/dashboard/overdue`   | Get overdue tasks      | Yes           |

### Notification Endpoints

| Method | Endpoint                      | Description            | Auth Required |
| ------ | ----------------------------- | ---------------------- | ------------- |
| GET    | `/api/notifications`          | Get user notifications | Yes           |
| PATCH  | `/api/notifications/:id/read` | Mark as read           | Yes           |
| PATCH  | `/api/notifications/read-all` | Mark all as read       | Yes           |

---

## 🏗 Backend Architecture

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Routes Layer                          │
│  (auth.routes.ts, task.routes.ts, dashboard.routes.ts)      │
├─────────────────────────────────────────────────────────────┤
│                     Middleware Layer                         │
│  (auth.middleware, validation.middleware, error.middleware) │
├─────────────────────────────────────────────────────────────┤
│                     Controller Layer                         │
│  (AuthController, TaskController, DashboardController)      │
├─────────────────────────────────────────────────────────────┤
│                      Service Layer                           │
│  (AuthService, TaskService, NotificationService)            │
├─────────────────────────────────────────────────────────────┤
│                    Repository Layer                          │
│  (UserRepository, TaskRepository)                           │
├─────────────────────────────────────────────────────────────┤
│                       Model Layer                            │
│  (User, Task, Notification - Mongoose Models)               │
├─────────────────────────────────────────────────────────────┤
│                       Database                               │
│  (MongoDB)                                                   │
└─────────────────────────────────────────────────────────────┘
```

### Data Models

#### User Model

```typescript
{
  name: string,
  email: string (unique),
  password: string (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

#### Task Model

```typescript
{
  title: string (max 100 chars),
  description: string,
  dueDate: Date,
  priority: "Low" | "Medium" | "High" | "Urgent",
  status: "To Do" | "In Progress" | "Review" | "Completed",
  creatorId: ObjectId (ref: User),
  assignedToId: ObjectId (ref: User),
  createdAt: Date,
  updatedAt: Date
}
```

#### Notification Model

```typescript
{
  userId: ObjectId (ref: User),
  type: "assignment" | "update" | "mention" | "deadline",
  title: string,
  message: string,
  taskId: ObjectId (ref: Task),
  read: boolean,
  createdAt: Date
}
```

### Authentication Flow

1. **Registration**: User submits name, email, password → Password hashed with bcrypt → User saved to DB
2. **Login**: User submits email, password → Password verified → JWT token generated → Token sent in HTTP-only cookie
3. **Protected Routes**: Request includes cookie → JWT verified → User attached to request → Route handler executes
4. **Logout**: Cookie cleared

### Error Handling

Custom error classes for consistent error responses:

```typescript
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

class NotFoundError extends AppError {
  statusCode: 404;
}
class ValidationError extends AppError {
  statusCode: 400;
}
class UnauthorizedError extends AppError {
  statusCode: 401;
}
class ForbiddenError extends AppError {
  statusCode: 403;
}
```

---

## 🔄 Real-Time Features

### Socket.io Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Client 1  │◄───────►│   Server    │◄───────►│   Client 2  │
│  (Browser)  │         │ (Socket.io) │         │  (Browser)  │
└─────────────┘         └─────────────┘         └─────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   Rooms:    │
                        │ - dashboard │
                        │ - user:{id} │
                        └─────────────┘
```

### Socket Events

#### Client → Server

| Event             | Description                            |
| ----------------- | -------------------------------------- |
| `register`        | Register user with userId and userName |
| `join:dashboard`  | Join dashboard room for updates        |
| `leave:dashboard` | Leave dashboard room                   |

#### Server → Client

| Event                     | Description             |
| ------------------------- | ----------------------- |
| `task:created`            | New task created        |
| `task:updated`            | Task updated            |
| `task:deleted`            | Task deleted            |
| `notification:assignment` | Task assigned to user   |
| `onlineUsers`             | List of online user IDs |

### Real-Time Flow Example

```
1. Jane creates a task assigned to John
   │
   ▼
2. Backend saves task to MongoDB
   │
   ▼
3. Backend emits 'task:created' to dashboard room
   │
   ▼
4. Backend creates notification in DB
   │
   ▼
5. Backend emits 'notification:assignment' to John's room
   │
   ▼
6. John's browser receives notification
   │
   ▼
7. Toast notification appears + notification bell updates
```

---

## 🎨 Frontend Overview

### State Management

- **Server State**: React Query for API data caching and synchronization
- **Auth State**: React Context for user authentication
- **Socket State**: React Context for real-time connection

### Key Components

| Component          | Purpose                                     |
| ------------------ | ------------------------------------------- |
| `DashboardLayout`  | Main layout with sidebar and mobile support |
| `Sidebar`          | Navigation sidebar                          |
| `NotificationBell` | Real-time notifications display             |
| `CreateTaskDialog` | Task creation modal                         |
| `TaskDetailModal`  | Task view/edit modal                        |

### Responsive Design

- **Desktop**: Fixed sidebar with full navigation
- **Mobile**: Collapsible sidebar with hamburger menu

---

## 📝 Scripts

### Backend

```bash
npm run dev      # Start development server with hot reload
npm run build    # Build for production
npm run start    # Start production server
npm run test     # Run tests
```

### Frontend

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

Built with ❤️ using the MERN Stack
