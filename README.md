# AutoSense

Modern, innovative React frontend for AI-powered vehicle predictive maintenance system with stunning animations and car-themed design.

## ✨ Features

- 🎨 **Modern UI/UX** - Dark mode, glassmorphic cards, electric cyan accents
- 🚀 **Smooth Animations** - Framer Motion powered transitions and micro-interactions
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ⚡ **Fast Performance** - Built with Vite for lightning-fast dev experience
- 🎯 **TypeScript Ready** - Easy migration to TypeScript if needed
- 🔐 **Auth Flow** - Complete login/signup with multi-step form
- 📊 **Data Visualization** - Interactive charts with Recharts
- 🎭 **Component Library** - Reusable, well-organized components

## 🛠️ Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form
- **HTTP Client:** Axios
- **State Management:** Zustand

## 📦 Installation

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager

### Setup

1. **Clone or extract the project:**
```bash
cd AutoSense
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

The app will open at `http://localhost:3000`

## 🗂️ Project Structure

```
AutoSense/
├── src/
│   ├── components/          # Reusable components
│   │   └── Navbar.jsx       # Navigation bar
│   ├── pages/               # Page components
│   │   ├── Homepage.jsx     # Landing page
│   │   ├── Login.jsx        # Login page
│   │   ├── Signup.jsx       # Multi-step signup
│   │   └── Dashboard.jsx    # Main dashboard
│   ├── App.jsx              # Main app with routing
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles + Tailwind
├── public/                  # Static assets
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## 📄 Available Pages

### ✅ Completed Pages

1. **Homepage** (`/`) - Landing page with:
   - Animated hero section with 3D visuals
   - Feature showcase
   - Stats section
   - How it works
   - Dual model comparison
   - CTA sections

2. **Login** (`/login`) - Split-screen design with:
   - Email/password login
   - Google OAuth option
   - Password visibility toggle
   - Remember me checkbox
   - Forgot password link

3. **Signup** (`/signup`) - Multi-step form with:
   - Step 1: Account details
   - Step 2: Company information
   - Step 3: Confirmation
   - Progress indicator
   - Password strength checker

4. **Dashboard** (`/dashboard`) - Main hub with:
   - Fleet statistics cards
   - Quick action buttons
   - Health overview chart
   - Recent predictions table

### 🚧 To Be Implemented

5. **EV Prediction** (`/predict/ev`)
6. **Normal Vehicle Prediction** (`/predict/normal`)
7. **History** (`/history`)
8. **Analytics** (`/analytics`)
9. **Profile Settings** (`/profile`)

## 🎨 Design System

### Colors

```javascript
Primary (Electric Cyan): #00D9FF
Secondary (Indigo): #6366F1
Success (Green): #10B981
Warning (Amber): #F59E0B
Danger (Red): #EF4444
Dark Background: #0A0E1A
```

### Typography

- **Display/Headers:** Outfit (Google Fonts)
- **Body Text:** Inter (Google Fonts)
- **Monospace/Data:** JetBrains Mono (Google Fonts)

### Components

- **Buttons:** `.btn-primary`, `.btn-secondary`, `.btn-outline`
- **Cards:** `.glass-card` (glassmorphic style)
- **Inputs:** `.input-field`
- **Badges:** `.badge-success`, `.badge-warning`, `.badge-danger`

## 🔧 Configuration

### Environment Variables

Create `.env` file in root:

```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Create `backend/.env` for backend services:

```env
MONGO_URI=your_mongo_uri
DB_NAME=AutoSense
JWT_SECRET=your_jwt_secret
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-1.5-flash
GEMINI_API_VERSION=v1
```

For a custom chatbot icon, place your SVG at `public/chatbot-icon.svg`.

### Backend Integration

Update `VITE_API_URL` to point to your FastAPI backend:

```javascript
// src/config/api.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## 🚀 Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

Output will be in `dist/` folder.

## 📱 Responsive Breakpoints

```
sm:  640px  (Mobile landscape)
md:  768px  (Tablet)
lg:  1024px (Desktop)
xl:  1280px (Large desktop)
2xl: 1536px (Extra large)
```

## 🎭 Animation Guide

### Framer Motion Examples

**Page Transitions:**
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  {/* Content */}
</motion.div>
```

**Hover Effects:**
```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

**Staggered Children:**
```jsx
<motion.div
  initial="hidden"
  animate="show"
  variants={{
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div variants={itemVariants}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

## 🔗 API Integration Examples

### Login
```javascript
import axios from 'axios';

const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

### Get Predictions
```javascript
const getPredictions = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/predictions/history`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
```

## 🐛 Troubleshooting

### Issue: Tailwind styles not working
**Solution:** Make sure `tailwind.config.js` content paths are correct:
```javascript
content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]
```

### Issue: Framer Motion animations laggy
**Solution:** Use `transform` and `opacity` properties for better performance:
```javascript
// Good (GPU accelerated)
animate={{ opacity: 1, scale: 1 }}

// Avoid (causes reflows)
animate={{ width: '100px', height: '100px' }}
```

### Issue: Charts not rendering
**Solution:** Ensure Recharts ResponsiveContainer has a defined height:
```jsx
<div className="h-80">
  <ResponsiveContainer width="100%" height="100%">
    {/* Chart components */}
  </ResponsiveContainer>
</div>
```

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Recharts Examples](https://recharts.org/en-US/examples)
- [React Router Guide](https://reactrouter.com/)

## 🎯 Next Steps

1. **Complete Remaining Pages:**
   - EV Prediction page with form
   - Normal Vehicle Prediction page
   - History with timeline view
   - Analytics with SHAP visualizations
   - Profile settings

2. **Add Backend Integration:**
   - Connect to FastAPI endpoints
   - Implement JWT authentication
   - Add API error handling
   - Create loading states

3. **Enhance Features:**
   - Add real-time notifications
   - Implement file upload for batch predictions
   - Add export functionality (CSV/PDF)
   - Create dark/light theme toggle

4. **Testing:**
   - Add unit tests (Vitest)
   - E2E tests (Playwright)
   - Accessibility testing

5. **Deployment:**
   - Deploy to Vercel/Netlify
   - Set up CI/CD pipeline
   - Configure environment variables
   - Add monitoring

## 📝 Code Style

- Use functional components with hooks
- Follow ESLint rules (if configured)
- Use meaningful variable names
- Add comments for complex logic
- Keep components small and focused
- Use Tailwind classes over custom CSS

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for your needs!

## 💡 Tips for Development

1. **Hot Reload:** Vite provides instant HMR - save and see changes immediately
2. **Component Dev:** Test components in isolation before integration
3. **Responsive Testing:** Use browser dev tools to test all breakpoints
4. **Performance:** Use React DevTools Profiler to identify bottlenecks
5. **Accessibility:** Test with keyboard navigation and screen readers

---

**Built with ❤️ for predictive maintenance**

For questions or issues, please open a GitHub issue or contact the development team.
