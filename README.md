# GoXpress - Point of Sale System

A modern full-stack Point of Sale (POS) system for retail businesses, built with React, Node.js, Express, and PostgreSQL.

![GoXpress Logo](frontend/public/logo-full.svg)

## Overview

GoXpress helps stores manage day-to-day operations in one place:
- Process sales quickly from a clean POS interface
- Track products and stock levels in real time
- Manage customers and purchase history
- Generate analytics and sales reports
- Control access with role-based permissions

## Features

### Core Functionality
- **POS Sales:** Fast checkout flow with receipt support
- **Inventory Management:** Add, edit, and track product stock
- **Customer Management:** Maintain customer records and history
- **Sales Reports:** View key business metrics and trends
- **Authentication:** Secure login using JWT
- **Role-Based Access:** Admin, Manager, and Cashier permissions

### User Experience
- Responsive, modern interface
- Dark mode support
- Collapsible sidebar navigation
- Interactive charts and dashboard cards
- Real-time form validation
- Contact support modal

### Security
- JWT-based authentication
- Password hashing with bcrypt
- RBAC authorization rules
- Rate limiting
- CORS protection
- Helmet security headers

## Tech Stack

### Frontend
- **React 18**
- **Vite**
- **React Router**
- **Axios**
- **Recharts**
- **jsPDF**

### Backend
- **Node.js**
- **Express**
- **PostgreSQL** (Supabase)
- **JWT**
- **Passport**
- **Zod**

## Prerequisites

Install the following before setup:
- **Node.js** 18+
- **npm** or **yarn**
- **PostgreSQL** (or a Supabase account)
- **Git**

## Getting Started

### 1) Clone the Repository

```bash
git clone https://github.com/OwusuAsieduMichael/goxpress.git
cd goxpress
```

### 2) Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Update .env with DATABASE_URL, JWT_SECRET, and related values
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3) Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 4) Access the App

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000/api`

## Environment Variables

### Backend (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
API_URL=http://localhost:5000/api
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## User Roles

| Role | Key Permissions |
| --- | --- |
| **Admin** | Full access to products, inventory, customers, sales, and reports |
| **Manager** | Operational management access similar to Admin |
| **Cashier** | Process sales, manage customers, view reports, read-only products/inventory |

## Project Structure

```text
goxpress/
|-- backend/
|   |-- src/
|   |   |-- config/         # app and environment configuration
|   |   |-- controllers/    # request handlers
|   |   |-- middleware/     # custom Express middleware
|   |   |-- models/         # data models and validation schemas
|   |   |-- routes/         # API route definitions
|   |   |-- utils/          # shared helper functions
|   |   |-- app.js          # Express app setup
|   |   `-- server.js       # backend entry point
|   |-- sql/                # SQL migrations
|   `-- package.json
|-- frontend/
|   |-- public/             # static assets
|   |-- src/
|   |   |-- components/     # reusable UI components
|   |   |-- layouts/        # layout wrappers
|   |   |-- pages/          # page-level views
|   |   |-- styles/         # CSS and styling files
|   |   |-- App.jsx         # main application component
|   |   `-- main.jsx        # frontend entry point
|   `-- package.json
`-- README.md
```

## Database (Main Tables)

- `users`
- `products`
- `categories`
- `inventory`
- `sales`
- `sale_items`
- `customers`
- `payments`

## Deployment

Recommended options:
1. **Vercel** (frontend) + **Render** (backend)
2. **Railway** (full stack)
3. **DigitalOcean App Platform**

See `DEPLOYMENT.md` for full deployment guidance.

## Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add my feature"`
4. Push branch: `git push origin feature/my-feature`
5. Open a pull request

## License

Licensed under the MIT License. See `LICENSE`.

## Author

Michael Owusu Asiedu  
GitHub: [@OwusuAsieduMichael](https://github.com/OwusuAsieduMichael)  
Email: `owusuasiedumichael9@gmail.com`

## Support

- Open a GitHub issue
- Use the in-app Contact Support form (Help page)
- Email: `support@goxpress.com`

