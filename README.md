# SnapDent India - Dental E-Commerce Platform

SnapDent India is a full-stack e-commerce web application dedicated to providing high-quality dental products and equipment. It features a modern, responsive user interface built with React, and a robust Node.js/Express backend API for handling products, orders, authentication, and payments.

## 🚀 Features

### Customer Features
- **Product Catalog**: Browse and search a wide variety of dental products by categories.
- **Shopping Cart**: Add, remove, and manage items in the cart before checkout.
- **Checkout & Payments**: Secure payment gateway integration using Razorpay.
- **User Accounts**: Registration and login using secure JWT authentication.
- **Order Tracking**: View past orders and track current shipping statuses.
- **Responsive Design**: Fully responsive interface for mobile and desktop viewing.

### Admin Dashboard
- **Product Management**: Add, update, or remove products and manage inventory.
- **Order Management**: View and process customer orders and update payment/delivery statuses.
- **Customer Management**: View registered users and their activity.
- **Message Center**: View contact form submissions and inquiries.
- **Dashboard Analytics**: High-level overview of sales and platform activity.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + Vite
- **Routing**: React Router DOM
- **Search**: Fuse.js for client-side search capabilities
- **Styling**: Vanilla CSS (Fully responsive custom design)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ORM
- **Authentication**: JSON Web Tokens (JWT) & bcryptjs for password hashing
- **Payments**: Razorpay SDK
- **File Uploads**: Multer & Google Drive API integration
- **Email Service**: Resend API
- **Security**: Helmet, express-rate-limit, express-mongo-sanitize, hpp, cors

## 📂 Project Structure

```
SnapDent/
├── public/                 # Static assets for the frontend
├── server/                 # Backend Node.js/Express application
│   ├── public/uploads/     # Local image uploads directory
│   ├── src/
│   │   ├── config/         # Database, third-party integrations (Razorpay, GDrive)
│   │   ├── controllers/    # Route controllers handling business logic
│   │   ├── middleware/     # Custom middlewares (auth, upload, errorHandler)
│   │   ├── models/         # Mongoose database schemas
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # External services (Email Service)
│   │   ├── index.js        # Backend entry point
│   │   └── seed.js         # Database seeding script
│   └── package.json        # Backend dependencies
├── src/                    # Frontend React application
│   ├── admin/              # Admin dashboard pages and components
│   ├── api/                # API client functions for connecting to backend
│   ├── components/         # Reusable UI components (Navbar, ProductCard, SEO)
│   ├── context/            # React Context (Auth Context)
│   ├── pages/              # Main application pages (Home, Shop, Cart, Login, etc.)
│   ├── App.jsx             # Main React Application component
│   └── main.jsx            # Frontend entry point
├── package.json            # Frontend dependencies
└── vite.config.js          # Vite configuration
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB instance (local or Atlas)
- Razorpay Account (for payments)
- Resend Account (for emails)

### 1. Clone the repository
```bash
git clone https://github.com/Snapdent/SnapDentIndia.git
cd SnapDent
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory and add the following environment variables (refer to `server/.env.example` if available):
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RESEND_API_KEY=your_resend_api_key
```

Run the development server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal and navigate to the project root:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```
The application will usually be available at `http://localhost:5173`.

## 🛡️ Security Measures
- Passwords are cryptographically hashed using `bcryptjs`.
- Session management is handled securely with JWT.
- API endpoints are protected using middleware to prevent NoSQL injection, XSS, and parameter pollution.
- Rate limiting is implemented to mitigate brute-force attacks.

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

1. Fork the project.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📝 License
This project is proprietary and confidential. Unauthorized copying of these files, via any medium, is strictly prohibited.
