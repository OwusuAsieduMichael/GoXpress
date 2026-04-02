# GoXpress Repository Structure

This document explains the organization of the GoXpress repository.

## 📁 Root Directory

```
goxpress-pos-system/
├── 📂 backend/                    # Backend API (Node.js + Express)
├── 📂 frontend/                   # Frontend UI (React + Vite)
├── 📂 .kiro/                      # Kiro IDE configuration
├── 📄 .gitignore                  # Git ignore rules
├── 📄 README.md                   # Project overview (main page)
├── 📄 PROJECT_DOCUMENTATION.md    # Complete technical documentation
├── 📄 CONTRIBUTING.md             # Contribution guidelines
├── 📄 LICENSE                     # MIT License
├── 📄 GITHUB_SETUP_GUIDE.md       # GitHub setup instructions
└── 📄 [Other documentation files]
```

## 📂 Backend Structure

```
backend/
├── 📂 src/
│   ├── 📂 config/                 # Configuration files
│   │   ├── db.js                  # Database connection
│   │   ├── env.js                 # Environment variables
│   │   └── passport.js            # OAuth configuration
│   ├── 📂 controllers/            # Business logic
│   │   ├── authController.js      # Authentication
│   │   ├── productController.js   # Product management
│   │   ├── salesController.js     # Sales processing
│   │   ├── customerController.js  # Customer management
│   │   ├── inventoryController.js # Inventory operations
│   │   ├── reportController.js    # Analytics & reports
│   │   └── paymentController.js   # Payment processing
│   ├── 📂 middleware/             # Express middleware
│   │   ├── authMiddleware.js      # JWT verification
│   │   ├── errorMiddleware.js     # Error handling
│   │   ├── rateLimit.js           # Rate limiting
│   │   └── validate.js            # Request validation
│   ├── 📂 models/                 # Data models
│   │   └── schemas.js             # Zod validation schemas
│   ├── 📂 routes/                 # API routes
│   │   ├── auth.js                # /api/auth/*
│   │   ├── products.js            # /api/products/*
│   │   ├── sales.js               # /api/sales/*
│   │   ├── customers.js           # /api/customers/*
│   │   ├── inventory.js           # /api/inventory/*
│   │   ├── reports.js             # /api/reports/*
│   │   └── payments.js            # /api/payments/*
│   ├── 📂 utils/                  # Utility functions
│   │   ├── apiError.js            # Custom error class
│   │   ├── asyncHandler.js        # Async error wrapper
│   │   ├── jwt.js                 # JWT utilities
│   │   └── checkDb.js             # DB health check
│   ├── app.js                     # Express app setup
│   └── server.js                  # Server entry point
├── 📂 sql/                        # Database migrations
│   ├── 001_schema.sql             # Initial schema
│   ├── 002_seed.sql               # Seed data
│   └── [other migrations]
├── .env.example                   # Environment template
├── package.json                   # Dependencies
└── package-lock.json              # Locked dependencies
```

## 📂 Frontend Structure

```
frontend/
├── 📂 public/                     # Static assets
│   ├── 📂 products/               # Product images
│   │   ├── food/                  # Food category images
│   │   ├── gadgets/               # Gadgets category images
│   │   └── ghana-foods/           # Ghana foods images
│   ├── logo-full.svg              # Full logo
│   ├── logo-icon.svg              # Icon only
│   ├── logo-simple.svg            # Simple version
│   ├── logo-dark.svg              # Dark theme logo
│   └── welcome-image.jpg          # Landing page image
├── 📂 src/
│   ├── 📂 components/             # Reusable components
│   │   └── common/
│   │       ├── Sidebar.jsx        # Navigation sidebar
│   │       └── Topbar.jsx         # Top navigation bar
│   ├── 📂 layouts/                # Layout components
│   │   └── AppLayout.jsx          # Main app wrapper
│   ├── 📂 pages/                  # Page components
│   │   ├── Landing.jsx            # Landing/welcome page
│   │   ├── Login.jsx              # Login page
│   │   ├── Signup.jsx             # Registration page
│   │   ├── Dashboard.jsx          # Analytics dashboard
│   │   ├── POSSales.jsx           # Point of sale
│   │   ├── Products.jsx           # Product catalog
│   │   ├── Inventory.jsx          # Inventory management
│   │   ├── Customers.jsx          # Customer management
│   │   ├── Reports.jsx            # Reports & analytics
│   │   ├── Help.jsx               # Help & support
│   │   └── Settings.jsx           # User settings
│   ├── 📂 styles/                 # Stylesheets
│   │   └── global.css             # Global styles
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Entry point
│   └── api.js                     # Axios configuration
├── .env.example                   # Environment template
├── index.html                     # HTML template
├── vite.config.js                 # Vite configuration
├── package.json                   # Dependencies
└── package-lock.json              # Locked dependencies
```

## 📄 Documentation Files

### Essential Files (Always Read These First)
- **README.md**: Project overview, quick start guide, features
- **PROJECT_DOCUMENTATION.md**: Complete technical documentation (2,500+ lines)
- **CONTRIBUTING.md**: How to contribute to the project
- **LICENSE**: MIT License terms

### Setup Guides
- **GITHUB_SETUP_GUIDE.md**: Step-by-step GitHub setup
- **GOOGLE_OAUTH_SETUP.md**: OAuth integration guide

### Implementation Guides
- **RBAC_IMPLEMENTATION.md**: Role-based access control details
- **ROLE_PERMISSIONS.md**: User role permissions matrix
- **LOGO_IMPLEMENTATION_SUMMARY.md**: Logo usage guide
- **LOGO_DESIGN_GUIDE.md**: Logo design specifications

### Product & Image Guides
- **PRODUCT_IMAGES_SETUP.md**: Product image organization
- **PRODUCT_LIST_FOR_IMAGES.md**: Product catalog reference
- **REORGANIZE_IMAGES_GUIDE.md**: Image reorganization guide
- **IMAGE_VERIFICATION_CHECKLIST.md**: Image verification steps

## 🚫 Files NOT in Repository (.gitignore)

These files are excluded for security and performance:

```
❌ node_modules/          # Dependencies (too large)
❌ .env files             # Sensitive credentials
❌ dist/                  # Build outputs
❌ *.log                  # Log files
❌ .DS_Store              # Mac OS files
❌ Thumbs.db              # Windows files
❌ .vscode/               # IDE settings
```

## 📊 Repository Statistics

- **Total Files**: ~150+ files
- **Lines of Code**: ~6,000+ lines
- **Documentation**: ~4,000+ lines
- **Languages**: JavaScript, SQL, CSS, HTML
- **Frameworks**: React, Express, Node.js
- **Database**: PostgreSQL

## 🔑 Key Files to Review

### For Developers
1. `README.md` - Start here
2. `PROJECT_DOCUMENTATION.md` - Technical deep dive
3. `backend/src/app.js` - Backend entry point
4. `frontend/src/App.jsx` - Frontend entry point
5. `CONTRIBUTING.md` - Before contributing

### For Deployment
1. `backend/.env.example` - Backend configuration
2. `frontend/.env.example` - Frontend configuration
3. `backend/sql/` - Database migrations
4. `PROJECT_DOCUMENTATION.md` (Section 10) - Deployment guide

### For Understanding Architecture
1. `PROJECT_DOCUMENTATION.md` (Section 2) - System architecture
2. `PROJECT_DOCUMENTATION.md` (Section 4) - Database design
3. `backend/src/routes/` - API endpoints
4. `frontend/src/pages/` - UI pages

## 📦 Dependencies

### Backend (package.json)
- express - Web framework
- pg - PostgreSQL client
- jsonwebtoken - JWT authentication
- bcryptjs - Password hashing
- zod - Schema validation
- helmet - Security headers
- cors - Cross-origin requests

### Frontend (package.json)
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- recharts - Data visualization
- jspdf - PDF generation
- vite - Build tool

## 🌟 Repository Highlights

- ✅ Complete full-stack application
- ✅ Production-ready code
- ✅ Comprehensive documentation
- ✅ Security best practices
- ✅ Role-based access control
- ✅ Responsive design
- ✅ Dark mode support
- ✅ RESTful API
- ✅ Database migrations
- ✅ Environment configuration

## 🔄 Keeping Repository Updated

```bash
# Daily workflow
git pull                    # Get latest changes
git add .                   # Stage changes
git commit -m "message"     # Commit changes
git push                    # Push to GitHub

# Feature workflow
git checkout -b feature/name  # Create feature branch
# ... make changes ...
git commit -m "Add feature"
git push origin feature/name
# Create Pull Request on GitHub
```

---

**Last Updated**: April 1, 2026  
**Repository**: GoXpress POS System  
**License**: MIT
