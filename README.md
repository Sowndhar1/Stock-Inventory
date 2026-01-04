# 🧥 APPAREL STOCK TRACKER

A comprehensive, professional-grade inventory management system designed specifically for clothing stores and apparel businesses.

## ✨ Features

### 🔐 Authentication & Security
- **Secure Login/Logout** with JWT tokens
- **Password encryption** with bcrypt
- **Role-based access** (Admin/Staff)
- **Session management**

### 📊 Dashboard & Analytics
- **Real-time statistics** (Total products, sales, revenue)
- **Low stock alerts** with color-coded indicators
- **Recent sales tracking**
- **Performance metrics**

### 🧥 Product Management
- **Complete CRUD operations** (Create, Read, Update, Delete)
- **Advanced product attributes** (SKU, Brand, Category, Size, Color)
- **Stock level tracking** with automatic alerts
- **Barcode support** (ready for implementation)
- **Supplier information**

### 🛒 Sales Management
- **POS-style sales entry**
- **Automatic stock deduction**
- **Invoice generation**
- **Multiple payment methods**
- **Customer information tracking**

### 📈 Reports & Analytics
- **Daily/Monthly sales reports**
- **Product performance analytics**
- **Revenue tracking**
- **Export functionality** (Excel/PDF ready)

### ⚙️ Settings & Configuration
- **Store information management**
- **System preferences**
- **User settings**
- **Backup & restore options**

## 🚀 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Material-UI** for professional UI
- **React Router** for navigation
- **Context API** for state management

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd apparel-stock-tracker
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/apparel-tracker
JWT_SECRET=your-super-secret-jwt-key
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Start the Application

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm start
```

## 🔧 Configuration

### Database Setup
1. Install MongoDB locally or use MongoDB Atlas
2. Update the `MONGODB_URI` in your `.env` file
3. The database will be created automatically on first run

### Default Login
- **Username:** `admin`
- **Password:** `admin123`

## 📱 Mobile Responsive

The application is fully responsive and works perfectly on:
- ✅ Desktop computers
- ✅ Tablets
- ✅ Mobile phones
- ✅ All modern browsers

## 🎨 UI/UX Features

- **Professional Material-UI design**
- **Dark blue theme** with clean aesthetics
- **Responsive sidebar navigation**
- **Color-coded status indicators**
- **Touch-friendly mobile interface**
- **Smooth animations and transitions**

## 🔒 Security Features

- **JWT token authentication**
- **Password hashing** with bcrypt
- **Protected API routes**
- **Input validation** and sanitization
- **Error handling** with user-friendly messages

## 📊 Data Management

- **Real-time data updates**
- **Automatic stock calculations**
- **Sales tracking** with timestamps
- **Customer information** management
- **Product categorization** and filtering

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
```

### Backend (Railway/Render/Heroku)
```bash
cd backend
npm start
```

## 🔮 Future Enhancements

- [ ] **Barcode scanning** integration
- [ ] **Email notifications** for low stock
- [ ] **Advanced analytics** with charts
- [ ] **Multi-language support** (Tamil/English)
- [ ] **Dark mode** toggle
- [ ] **Mobile app** (React Native)
- [ ] **Cloud backup** integration
- [ ] **Advanced reporting** with custom date ranges

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

---

**Built with ❤️ for apparel businesses worldwide!** 🧥✨ 