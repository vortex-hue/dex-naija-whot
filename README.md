# Dex Naija Whot - Frontend 🎮

<br />
![Game play](./public/MultiplayerMockup.png)
<br />

This is a decentralized web-based Naija Whot card game with both single-player and multiplayer features. Experience the classic Nigerian card game with modern web technologies and blockchain integration.

🚧 **This application is still in its infancy stage and under active development.**

## 🌐 Live Demo
- **Live App**: https://dex-naija-whot.vercel.app
- **Backend API**: https://dex-naija-whot-backend.onrender.com
- **Backend Repository**: https://github.com/vortex-hue/dex-naija-whot-backend.git

## ⚙️ Technologies

**Frontend Stack:**
- React 18+ (Component-based UI)
- Redux (State management)
- [React-flip-toolkit](https://github.com/aholachek/react-flip-toolkit) (Smooth animations)
- SCSS (Styling)
- Socket.io-client (Real-time communication)

**Backend Integration:**
- Socket.io (Real-time multiplayer)
- RESTful API communication

**Blockchain Integration:**
- Solana Web3.js (Blockchain interaction)
- Honeycomb Protocol (Decentralized features)

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v18.x or higher)
- npm or yarn package manager
- A running backend server (see backend repository)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/vortex-hue/dex-naija-whot.git
   cd dex-naija-whot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

- `npm start` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (⚠️ irreversible)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
# Backend API URL
REACT_APP_SOCKET_URL=https://dex-naija-whot-backend.onrender.com

# For local development
# REACT_APP_SOCKET_URL=http://localhost:8080

# App Configuration
REACT_APP_TITLE=Dex Naija Whot
REACT_APP_DESCRIPTION=Decentralized Naija Whot Card Game
```

### Backend Connection
The frontend connects to the backend via Socket.io. Update the socket connection in `src/socket.jsx`:

```javascript
import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL || "https://dex-naija-whot-backend.onrender.com", {
  transports: ['polling', 'websocket'],
  upgrade: true,
  timeout: 20000,
});

export default socket;
```

## 🐛 Debugging Commands

### Development Debugging
```bash
# Start with verbose logging
npm start -- --verbose

# Build with source maps for debugging
GENERATE_SOURCEMAP=true npm run build

# Check for unused dependencies
npx depcheck

# Analyze bundle size
npx webpack-bundle-analyzer build/static/js/*.js
```

### Network Debugging
```bash
# Test backend connection
curl https://dex-naija-whot-backend.onrender.com/api/health

# Check Socket.io connection
# Open browser console and run:
# socket.connect(); socket.on('connect', () => console.log('Connected'));
```

### Common Issues & Solutions

1. **Socket.io connection failed**
   ```bash
   # Check if backend is running
   curl https://dex-naija-whot-backend.onrender.com
   
   # Clear browser cache and localStorage
   # Open DevTools > Application > Clear Storage
   ```

2. **Build errors**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   
   # Fix potential dependency conflicts
   npm audit fix
   ```

3. **CORS errors**
   ```bash
   # Ensure backend has correct CORS settings
   # Check backend logs for CORS errors
   ```

4. **Performance issues**
   ```bash
   # Check bundle size
   npm run build
   npx serve -s build
   
   # Analyze performance
   # Open DevTools > Lighthouse
   ```

## 📁 Project Structure

```
whot/
├── public/
│   ├── index.html
│   ├── MultiplayerMockup.png
│   └── favicon.ico
├── src/
│   ├── components/         # React components
│   ├── redux/             # Redux store and slices
│   ├── styles/            # SCSS stylesheets
│   ├── utils/             # Utility functions
│   ├── socket.jsx         # Socket.io configuration
│   ├── App.js            # Main App component
│   └── index.js          # Entry point
├── package.json
├── README.md
└── .env                  # Environment variables
```

## 🎮 Game Features

### Single Player Mode
- Play against AI opponent
- Multiple difficulty levels
- Offline gameplay support

### Multiplayer Mode
- Real-time multiplayer gameplay
- Room-based game sessions
- Player matching system
- Spectator mode (coming soon)

### Blockchain Integration
- Decentralized game records
- Token rewards (coming soon)
- NFT card collections (planned)

## 🚀 Deployment

### Vercel (Current)
The frontend is deployed on Vercel with automatic deployments from the main branch.

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `build`
- Install Command: `npm install`

### Alternative Deployments
The app can also be deployed to:
- Netlify
- Firebase Hosting
- GitHub Pages
- AWS S3 + CloudFront

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to your preferred hosting service
# Upload the contents of the 'build' folder
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- GameComponent.test.js
```

## 🎨 Customization

### Styling
The app uses SCSS for styling. Main style files:
- `src/styles/main.scss` - Global styles
- `src/styles/components/` - Component-specific styles
- `src/styles/variables.scss` - SCSS variables

### Animations
Animations are handled by React-flip-toolkit:
```javascript
import { Flipper, Flipped } from 'react-flip-toolkit';

// Wrap animated elements
<Flipper flipKey={gameState}>
  <Flipped flipId="card">
    <div className="card">...</div>
  </Flipped>
</Flipper>
```

## 📱 Progressive Web App (PWA)

The app includes PWA features:
- Offline gameplay support
- Installable on mobile devices
- Push notifications (coming soon)
- Background sync (planned)

## 🤝 Contributing

Contributions are welcome! Here's how to contribute:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test your changes**
   ```bash
   npm test
   npm start
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add: your feature description"
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Development Guidelines
- Follow React best practices
- Write tests for new components
- Use SCSS for styling
- Ensure responsive design
- Test multiplayer functionality

### Code Style
```bash
# Use Prettier for formatting
npx prettier --write src/

# Follow ESLint rules
npx eslint src/ --fix
```

## 🔒 Security

- Input validation on all user inputs
- Secure Socket.io connections
- XSS protection
- CSRF protection
- Environment variable management

## 📊 Performance

### Optimization Techniques
- Code splitting with React.lazy()
- Image optimization
- Bundle size monitoring
- Memory leak prevention
- Efficient re-rendering strategies

### Monitoring
```bash
# Bundle analysis
npm run build
npx webpack-bundle-analyzer build/static/js/*.js

# Lighthouse audit
# Open DevTools > Lighthouse > Generate Report
```

## 🐛 Known Issues

1. **Socket disconnection on mobile** - Working on reconnection logic
2. **Game state sync issues** - Implementing better error handling
3. **Animation performance on low-end devices** - Optimizing animations

## 🗺️ Roadmap

- [ ] Tournament mode
- [ ] Spectator functionality
- [ ] Chat system
- [ ] Game statistics
- [ ] Leaderboards
- [ ] NFT integration
- [ ] Mobile app (React Native)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Original Whot game concept
- React community for excellent tools
- Socket.io team for real-time capabilities
- Solana ecosystem for blockchain integration

---

**Note:** This project is in active development. Features and gameplay may change. For backend setup, see the [backend repository](https://github.com/vortex-hue/dex-naija-whot-backend.git).

## 🆘 Support

Need help? 
- Create an [issue](https://github.com/vortex-hue/dex-naija-whot/issues)
- Check our [discussions](https://github.com/vortex-hue/dex-naija-whot/discussions)
- Contact the maintainers

---
Made with ❤️ by the Dex Naija Whot team