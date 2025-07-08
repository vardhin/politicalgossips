# Political Gossips 🗳️

A modern full-stack web application for political news and gossip, built with cutting-edge technologies and designed for scalability and performance.

## 🚀 Tech Stack

### Frontend
- **Framework**: [SvelteKit](https://kit.svelte.dev/) - Modern web framework with server-side rendering
- **Language**: JavaScript with Svelte 5 (Runes)
- **Styling**: CSS with custom themes (light/dark mode)
- **Icons**: [Lucide Svelte](https://lucide.dev/) - Beautiful & consistent icon library
- **Build Tool**: Vite
- **Package Manager**: npm

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose ODM](https://mongoosejs.com/)
- **Authentication**: JWT (JSON Web Tokens) with refresh token rotation
- **Password Security**: bcrypt for hashing
- **File Upload**: Multer for handling image uploads
- **Environment**: dotenv for configuration management

### Security & Features
- **Content Security Policy (CSP)** with nonce-based protection
- **CORS** enabled for cross-origin requests
- **JWT Authentication** with access/refresh token system
- **Role-based Access Control** (Admin/User roles)
- **Image Upload & Storage** for article images
- **Server-Side Rendering (SSR)** for better SEO
- **Theme System** with localStorage persistence

## 📁 Project Structure

```
politicalgossips/
├── frontend/                 # SvelteKit frontend application
│   ├── src/
│   │   ├── routes/          # File-based routing
│   │   ├── lib/             # Shared components and utilities
│   │   └── app.html         # Main HTML template
│   └── .svelte-kit/         # Generated SvelteKit files
├── backend/                 # Express.js backend API
│   ├── index.js            # Main server file
│   ├── articleService.js   # Article business logic
│   └── README.md
└── README.md               # This file
```

## 🎯 Features

### Public Features
- **Featured Articles**: Curated political news on homepage
- **Category-based Browsing**: Organized content by political topics
- **Responsive Design**: Mobile-first approach with dark/light themes
- **SEO Optimized**: Server-side rendering for better search visibility

### Admin Features
- **Admin Dashboard**: Content management interface
- **Article Management**: Create, edit, and manage political articles
- **Image Upload**: Support for article images with multiple formats
- **Featured Article Control**: Mark articles as featured
- **Category Management**: Organize content by political categories

### Technical Features
- **Real-time Theme Switching**: Instant dark/light mode toggle
- **Optimized Loading**: Lazy loading and code splitting
- **Secure Authentication**: JWT-based auth with refresh tokens
- **Image Processing**: Automatic image optimization and storage
- **Error Handling**: Comprehensive error boundaries and fallbacks

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/politicalgossips.git
cd politicalgossips/backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Configuration**
Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/politicalgossips
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

4. **Start the backend server**
```bash
npm start
```

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
npm run preview
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout

### Articles
- `GET /api/articles` - Get all articles (with pagination)
- `GET /api/articles/featured` - Get featured articles
- `GET /api/articles/category/:category` - Get articles by category
- `GET /api/articles/:id` - Get single article
- `POST /api/articles` - Create new article (Admin only)
- `PUT /api/articles/:id` - Update article (Admin only)
- `DELETE /api/articles/:id` - Delete article (Admin only)

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **CORS Protection**: Configured for specific origins
- **Content Security Policy**: Prevents XSS attacks
- **Input Validation**: Comprehensive request validation
- **Role-based Access**: Admin-only routes protection

## 🎨 Theme System

The application features a sophisticated theme system:
- **Auto Detection**: Respects system preference on first visit
- **Persistence**: Saves user preference in localStorage
- **Instant Switching**: No page reload required
- **SSR Compatible**: Prevents flash of wrong theme

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Progressive Enhancement**: Works on all screen sizes
- **Touch Friendly**: Optimized for touch interfaces
- **Fast Loading**: Optimized bundle sizes and lazy loading

## 🚀 Deployment

### Backend Deployment
```bash
# Build and start
npm run build
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# The built files will be in the 'build' directory
# Deploy to your preferred hosting service (Vercel, Netlify, etc.)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - Initial work - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- SvelteKit team for the amazing framework
- MongoDB team for the robust database
- Lucide team for beautiful icons
- All contributors and supporters

## 📞 Support

If you have any questions or need help, please:
- Open an issue on GitHub
- Contact us at [your-email@example.com]
- Check our [documentation](./docs)

---

**Built with ❤️ for political transparency and information accessibility**