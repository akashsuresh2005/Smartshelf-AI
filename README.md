
# SmartShelf AI 🧠📦
### AI-Powered Inventory Monitoring & Expiry Tracking System

SmartShelf AI is an intelligent inventory management platform designed to minimize waste, improve inventory visibility, and simplify expiry tracking. By combining full-stack web development, AI-based item detection, automated notifications, and inventory analytics, the system helps users make smarter inventory and consumption decisions.

**Project Type:** AI / Full-Stack Web Application  
**Domain:** Artificial Intelligence, Inventory Management & Predictive Analytics

---

## 📌 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [Project Structure](#-project-structure)
- [Installation and Setup](#-installation-and-setup)
- [Environment Variables](#-environment-variables)
- [Application Workflow](#-application-workflow)
- [Future Enhancements](#-future-enhancements)
- [Author](#-author)
- [License](#-license)

---

## 🎯 Overview

Managing inventory manually can lead to expired products, unnecessary purchases, stock discrepancies, and avoidable waste.

SmartShelf AI addresses these challenges through centralized inventory tracking, automated expiry calculations, timely notifications, and data-driven insights.

The platform is designed for:

- 🏠 Homes and households
- 🏫 Hostels and educational institutions
- 🛒 Grocery stores and retail outlets
- 📦 Warehouses and inventory facilities
- 🏪 Smart retail shelf environments

---

## ✨ Key Features

### 1. 🤖 AI-Powered Item Detection
- Identifies product names and categories from supported image inputs.
- Reduces manual inventory data entry.
- Provides a foundation for automated product registration using computer vision.

### 2. 📅 Expiry Date Tracking
- Stores product details, quantities, manufacturing dates, and expiry dates.
- Automatically calculates the remaining shelf life of products.
- Highlights expired and near-expiry items.
- Helps users prioritize products that require immediate attention.

### 3. 🔔 Smart Notifications
- Sends reminders for products approaching their expiry dates.
- Supports email notifications using Nodemailer and SMTP.
- Supports browser push notifications using service workers and the Web Push API.
- Uses scheduled background jobs for automated expiry checks.

### 4. 📊 Inventory Dashboard & Analytics
- Displays inventory information and product quantities.
- Supports inventory updates and stock management.
- Provides graphical summaries and usage analytics.
- Helps users understand inventory patterns and product availability.

### 5. 🧠 AI-Based Predictions & Recommendations
- Supports analysis of consumption trends.
- Provides a foundation for purchase timing and replenishment recommendations.
- Helps identify potential overstocking and waste.
- Can be extended with machine learning for demand forecasting.

### 6. 🔐 Authentication & Security
- User registration and login.
- JWT-based authentication.
- Protected REST API endpoints.
- Support for role-based access control where configured.

---

## 🛠️ Technology Stack

| Category | Technologies |
|---|---|
| Frontend | React.js, HTML5, CSS3, JavaScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Authentication | JSON Web Tokens (JWT) |
| Notifications | Web Push API, Service Workers, Nodemailer |
| Background Jobs | Node.js scheduled jobs / Cron |
| AI & Intelligence | Computer Vision, Predictive Analytics |
| Version Control | Git, GitHub |

---

## 🏗️ System Architecture

```text
                   ┌─────────────────────┐
                   │     User / Admin    │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │   React Frontend    │
                   │   User Dashboard    │
                   └──────────┬──────────┘
                              │
                         REST APIs
                              │
                              ▼
                   ┌─────────────────────┐
                   │  Node.js + Express  │
                   │   Business Logic    │
                   └──────┬────────┬─────┘
                          │        │
                ┌─────────▼──┐  ┌──▼───────────┐
                │  MongoDB   │  │   AI Module  │
                │ Inventory  │  │ Detection &  │
                │ Users      │  │ Predictions  │
                └────────────┘  └──────────────┘
                          │        │
                          └────┬───┘
                               ▼
                    ┌────────────────────┐
                    │ Notification System│
                    │ Email & Web Push   │
                    └────────────────────┘
```

---

## 📁 Project Structure

```text
SmartShelf-AI/
│
├── frontend/                 # React frontend
│   ├── public/               # Static assets
│   └── src/                  # Components, pages and utilities
│
├── backend/                  # Node.js and Express API
│   ├── routes/               # API route definitions
│   ├── controllers/          # Request handlers
│   ├── models/               # MongoDB schemas
│   ├── middleware/           # Authentication and validation
│   ├── utils/                # Utility functions
│   ├── cronJobs.js           # Scheduled expiry checks
│   └── server.js             # Backend entry point
│
├── ai-module/                # AI detection and prediction logic
├── database/                 # Database configuration or scripts
├── docs/                     # Documentation and diagrams
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust it to match the actual repository.*

---

## ⚙️ Installation and Setup

### Prerequisites

Ensure that the following tools are installed:

- [Node.js](https://nodejs.org/)
- npm
- [MongoDB](https://www.mongodb.com/) or MongoDB Atlas
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/smartshelf-ai.git
cd smartshelf-ai
```

Replace `your-username` with your GitHub username and use the correct repository URL.

### 2. Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file using the configuration shown below.

Start the backend:

```bash
npm start
```

### 3. Frontend Setup

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL provided by Vite in the terminal.

> Note: Use the scripts defined in each directory's `package.json`. Commands may differ depending on the project configuration.

---

## 🔑 Environment Variables

Create a `.env` file inside the backend directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret_key
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_app_password
```

Add any additional variables required by the AI provider or push notification configuration.

### Security Best Practices

- Never commit `.env` files or private credentials to GitHub.
- Use strong, unique JWT secrets.
- Store production credentials in environment variables.
- Validate user inputs and protect sensitive API endpoints.

---

## 🔄 Application Workflow

1. **Authentication:** Users sign in to access their inventory.
2. **Product Registration:** Items are added manually or through supported AI-based detection.
3. **Inventory Management:** Product quantities, categories, and expiry dates are stored and updated.
4. **Expiry Analysis:** The system calculates remaining shelf life and identifies products requiring attention.
5. **Notifications:** Scheduled checks trigger relevant email or browser alerts.
6. **Analytics:** Inventory data supports usage summaries and smarter stock management.
7. **Recommendations:** Supported AI or predictive modules provide inventory insights.

---

## 🌱 Expected Outcomes

- Improved inventory visibility and organization.
- Early identification of expiring products.
- Reduced avoidable food and material waste.
- Better stock management and purchase planning.
- Automated expiry reminders.
- A foundation for intelligent inventory recommendations.

---

## 🚀 Future Enhancements

- 📷 Barcode and QR-code scanning.
- 📱 Mobile application integration.
- ☁️ Cloud deployment using AWS or Google Cloud.
- 📡 IoT-enabled smart shelves and sensors.
- 🧠 Advanced deep-learning-based product recognition.
- 📈 Machine-learning-based demand forecasting.
- 🔄 Multi-location inventory synchronization.

---

## 👨‍💻 Author

**Akash Kulkarni**  
Final-Year B.E. Computer Science and Engineering  
Bangalore Institute of Technology, Bengaluru, Karnataka, India

---

## 📄 License

This project is developed for academic and research purposes.

If you intend to distribute the project as open-source software, add an appropriate license file to the repository.

---

⭐ **If you find this project interesting, consider giving the repository a star!**
