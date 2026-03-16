# 🎓 E-Learning Platform

A full-stack Learning Management System (LMS) built from scratch with a modern tech stack. Designed to deliver a seamless experience for both students and instructors, with a strong focus on UI/UX, security, and performance.

🔗 **Live Demo:** [e-learning-omar.vercel.app](https://e-learning-omar.vercel.app/)

---

## ✨ Features

### 🔐 Authentication & Security
- Secure **Login / Signup** with password strength validation
- **JWT**-based session management
- Password hashing with **Bcrypt**
- API protection via **Helmet**, **CORS**, and **Rate Limiting**

### 👨‍🏫 Instructor Dashboard
- Detailed statistics and analytics
- Revenue & sales charts
- Full control over student access (grant / revoke per course)

### 📚 Interactive Learning Environment
- Add course videos via **YouTube links** or **direct file uploads**
- Engaging **commenting system** on lessons
- Interactive **quizzes** for students

### 📊 Progress Tracking
- Dynamic progress bars showing student completion rates per course

### 💳 Payment Integration
- Secure course purchasing powered by **Stripe**

### 🌗 UI / UX
- Fully **responsive** design across all screen sizes
- Smooth **Dark / Light Mode** toggle

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React + Vite | Fast, modern UI |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | Accessible component library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT | Authentication tokens |
| Bcrypt | Password hashing |
| Helmet / CORS / Rate Limiting | API security |
| Multer + Cloudinary / AWS S3 | File & video uploads |
| Stripe | Payment processing |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB instance (local or Atlas)
- Stripe account
- Cloudinary or AWS S3 account

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/e-learning-platform.git
cd e-learning-platform
```

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

#### Frontend Setup
```bash
cd client
npm install
cp .env.example .env   # Fill in your environment variables
npm run dev
```

---

## ⚙️ Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

STRIPE_SECRET_KEY=your_stripe_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

---

## 📁 Project Structure

```
e-learning-platform/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── app/            # App-level logic / Providers
│   │   ├── assets/         # Static files (Images, fonts)
│   │   ├── components/     # Reusable UI components
│   │   ├── features/       # Feature-based logic & slices
│   │   ├── layout/         # Main layout wrappers (Navbar, Sidebar)
│   │   ├── lib/            # Utilities, API config & Axios
│   │   ├── pages/          # Route-level pages
│   │   ├── App.jsx         # Main React component
│   │   └── main.jsx        # Frontend entry point
│   └── vite.config.js
│
└── server/                 # Express backend
    ├── controllers/        # Route handlers logic
    ├── database/           # DB connection & configuration
    ├── middlewares/        # Custom Express middlewares (Auth, Errors)
    ├── models/             # Mongoose schemas
    ├── routes/             # API route definitions
    ├── uploads/            # Local file uploads directory
    ├── utils/              # Helper functions
    ├── index.js            # Server entry point
    └── vercel.json         # Vercel deployment config
```

---

## 🔮 Roadmap

- [ ] Live sessions / webinars integration
- [ ] Certificate generation upon course completion
- [ ] Multi-language support (i18n)
- [ ] Mobile app (React Native)
- [ ] Email notifications

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Omar**
- Live Project: [e-learning-omar.vercel.app](https://e-learning-omar.vercel.app/)
- GitHub: [omarmohamed-909](https://github.com/omarmohamed-909)