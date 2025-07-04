# Featherweight Research Platform (app.featherweight.world)

A comprehensive research platform for authorized users to manage projects, datasets, and collaborations.

## Features

### 🔐 Authentication System
- Secure login/registration with demo credentials
- Protected routes with automatic redirects
- User profile management with research areas

### 📊 Dashboard
- Real-time project statistics
- Quick action buttons for common tasks
- Recent activity feed and project overview
- Research area management

### 🔬 Research Project Management
- Create and manage research projects
- Track project progress with visual indicators
- Collaborate with team members
- Project status tracking (Draft, Active, Completed, Archived)

### 📁 Data Management
- Upload and organize research datasets
- Support for multiple file formats (CSV, JSON, XLSX, XML, TXT)
- Dataset metadata and statistics
- Data analysis tools integration

### 👤 User Profile
- Personal information management
- Research areas and specializations
- Security settings (2FA, password management)
- Organization and collaboration preferences

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Material-UI styled-components
- **Build Tool**: Create React App
- **Development**: Hot reloading, ESLint, TypeScript checking

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   The app will be available at http://localhost:3000

4. **Build for production**:
   ```bash
   npm run build
   ```

### Demo Access

Use these credentials to access the demo:
- **Email**: demo@featherweight.world
- **Password**: demo123

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── layout/          # Layout components (nav, sidebar)
│   └── common/          # Shared components
├── pages/               # Page components
│   ├── auth/            # Login, registration pages
│   ├── dashboard/       # Dashboard page
│   ├── research/        # Research project management
│   ├── data/            # Data management pages
│   └── profile/         # User profile pages
├── contexts/            # React Context providers
├── services/            # API and external service integrations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and themes
└── hooks/               # Custom React hooks
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (irreversible)

## Design System

### Color Palette
- **Primary**: Brown tones (#8B4513, #A0522D)
- **Secondary**: Beige complements (#DEB887, #F5DEB3)
- **Background**: Light neutral (#FAFAFA)
- **Text**: Dark brown (#2E1A0D, #5D4037)

### Typography
- **Font Family**: Inter, Roboto, Helvetica Neue
- **Headings**: Bold weights (600-700)
- **Body Text**: Regular weight (400) with good line height

### Components
- **Buttons**: Rounded corners (8px), gradient backgrounds
- **Cards**: Elevated with subtle shadows (12px radius)
- **Forms**: Outlined inputs with 8px radius
- **Navigation**: Sidebar with highlighted active states

## Authentication & Security

Currently implemented with mock authentication for demo purposes. For production:

1. **Backend Integration**:
   - Replace mock auth service with real API calls
   - Implement JWT token management
   - Add refresh token handling

2. **Security Features**:
   - Password strength validation
   - Two-factor authentication setup
   - Session management
   - HTTPS enforcement

## Data Management

The app supports various research data formats:
- **CSV**: Tabular data with automatic column detection
- **JSON**: Structured data with nested object support
- **XLSX**: Excel files with multiple sheet support
- **XML**: Hierarchical data structures
- **TXT**: Plain text data files

## Deployment

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
serve -s build
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY build/ ./build/
EXPOSE 3000
CMD ["npx", "serve", "-s", "build", "-p", "3000"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced data visualization tools
- [ ] API integration for external data sources
- [ ] Advanced search and filtering
- [ ] Export and reporting capabilities
- [ ] Mobile app companion
- [ ] Integration with academic databases
- [ ] Advanced analytics and insights

## Support

For technical support or questions, please contact the development team or create an issue in the repository.

---

**Featherweight Research Platform** - Empowering research through elegant technology.
