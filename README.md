# Due Diligence Finance

## Professional Investment Management System

Due Diligence Finance is a comprehensive investment management platform designed to streamline portfolio management, client relations, and investment operations for financial advisory firms. Built with Spring Boot and following Test-Driven Development (TDD) principles, the system provides secure, scalable, and efficient management of US stock market investments.

### 🎯 Key Features

- **Multi-Role Access Control**: Secure role-based access for Admins, Employees, Clients, and Guests
- **US Stock Market Integration**: Real-time stock data, portfolio tracking, and investment management
- **Client Portfolio Management**: Comprehensive tools for managing client investments and performance tracking
- **Secure Communication**: Built-in messaging system between clients and financial advisors
- **Automated Tax Documentation**: Generation of 1099-DIV, 1099-B, and annual statements
- **Audit & Compliance**: Complete audit trail and activity logging for regulatory compliance

### 🏗️ Architecture

The system follows a modular architecture with clear separation of concerns:

```
Due-Diligence-Finance/
├── core/                 # Domain layer (entities, core services, repositories)
├── backend/             # API layer (controllers, services, DTOs)
├── frontend/            # React application (coming soon)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API integration services
│   │   ├── store/       # State management
│   │   └── utils/       # Helper utilities
│   └── public/          # Static assets
├── src/                 # Main application entry point
└── docs/               # Documentation and requirements
```

### 🚀 Technology Stack

#### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: JPA/Hibernate (Database agnostic)
- **Security**: Spring Security with JWT authentication
- **Build Tool**: Gradle
- **Testing**: JUnit 5, Mockito, TDD methodology
- **API Documentation**: RESTful APIs with OpenAPI/Swagger support

#### Frontend (In Development)
- **Framework**: React 18.x
- **Language**: TypeScript
- **State Management**: Redux Toolkit / Context API
- **UI Components**: Material-UI / Ant Design
- **Styling**: Tailwind CSS / Styled Components
- **Build Tool**: Vite
- **Testing**: Jest, React Testing Library
- **API Client**: Axios with interceptors for JWT handling

### 📋 System Requirements

#### User Roles & Permissions

1. **Admin**
  - Full system access and configuration
  - User management and role assignment
  - System monitoring and backup operations
  - Audit log access and reporting

2. **Employee**
  - Client portfolio management
  - Investment creation and monitoring
  - Client communication
  - Performance reporting

3. **Client**
  - Portfolio viewing and performance tracking
  - Communication with assigned advisor
  - Investment request submission
  - Tax document access

4. **Guest**
  - Limited access to public information
  - Educational resources
  - Account upgrade requests

#### Core Functionality

- **Investment Management**
  - US stock market investments (NYSE, NASDAQ)
  - Real-time price tracking
  - Portfolio performance analytics
  - Transaction history

- **Client Relations**
  - Secure messaging system
  - Document sharing
  - Investment preferences management
  - Risk profiling

- **Compliance & Reporting**
  - Comprehensive audit logging
  - User activity tracking
  - Tax document generation
  - Regulatory compliance tools

### 🛠️ Installation & Setup

#### Prerequisites

- Java 17 or higher
- Node.js 18.x or higher
- npm or yarn package manager
- Gradle 7.x or higher
- Your preferred IDE (IntelliJ IDEA for backend, Neovim (configuration located in .dotfiles repository) & Web-based VS Code for frontend)
- Database (H2 for development, PostgreSQL/MySQL for production)

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/ddJProj/Due-Diligence-Finance
   cd due-diligence-finance
   ```

2. **Backend Setup**
   ```bash
   # Build the backend
   ./gradlew clean build
   
   # Run backend tests
   ./gradlew test
   
   # Start the backend application
   ./gradlew bootRun
   ```
   Backend will start on `http://localhost:8080`

3. **Frontend Setup** (When available)
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install dependencies
   npm install
   # or
   yarn install
   
   # Start development server
   npm run dev
   # or
   yarn dev
   ```
   Frontend will start on `http://localhost:5173`

### 🎨 Frontend Development (React)

The frontend application provides a modern, responsive user interface for all user roles:

#### Features by Role

##### Admin Dashboard
- System analytics and metrics visualization
- User management interface
- Real-time system monitoring
- Backup and restore operations

##### Employee Portal
- Client portfolio overview
- Investment creation and management tools
- Performance analytics dashboards
- Client communication center

##### Client Interface
- Portfolio dashboard with real-time updates
- Investment performance charts
- Secure messaging with advisors
- Document center for tax forms

##### Guest Access
- Educational resources browser
- Investment calculators
- Account upgrade wizard
- Company information pages

#### Frontend Architecture

- **Component Structure**: Atomic design pattern (atoms → molecules → organisms → templates → pages)
- **Routing**: React Router v6 with protected routes
- **API Integration**: Centralized API service layer with interceptors
- **Error Handling**: Global error boundary with user-friendly messages
- **Performance**: Code splitting, lazy loading, and memoization
- **Accessibility**: WCAG 2.1 AA compliant components

### 📊 API Documentation

Once the application is running, access the API documentation at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI Spec: `http://localhost:8080/v3/api-docs`

#### Key API Endpoints

##### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Token refresh

##### Admin Operations
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/users` - User management
- `POST /api/admin/backup` - System backup

##### Client Services
- `GET /api/clients/me/portfolio` - Portfolio summary
- `GET /api/clients/me/investments` - Investment list
- `POST /api/clients/messages` - Send message to advisor

##### Employee Functions
- `GET /api/employees/clients` - Assigned clients
- `POST /api/employees/investments` - Create investment
- `PUT /api/employees/investments/{id}` - Update investment

### 🧪 Testing

The project follows Test-Driven Development (TDD) principles with comprehensive test coverage:

#### Backend Testing
```bash
# Run all backend tests
./gradlew test

# Run tests with coverage report
./gradlew test jacocoTestReport

# View coverage report
open build/reports/jacoco/test/html/index.html
```

#### Frontend Testing (When available)
```bash
# Navigate to frontend directory
cd frontend

# Run unit tests
npm run test
# or
yarn test

# Run tests with coverage
npm run test:coverage
# or
yarn test:coverage

# Run E2E tests
npm run test:e2e
# or
yarn test:e2e
```

### 📈 Development Status

#### Implementation Progress: ~80% Complete

##### ✅ Completed Components
- Core domain entities and enums
- Repository layer
- Authentication & authorization framework
- Role-based controllers
- DTO layer
- Service interfaces
- Guest, Client, Employee, and Admin services

##### 🚧 In Progress
- Security implementation (JWT, Token blacklist)
- Transaction entity implementation
- System configuration management
- Integration testing
- Frontend React application setup
- UI component library development

##### 📋 Planned Features
- Complete React frontend with role-based views
- Real-time stock data integration with WebSocket
- Advanced portfolio analytics with interactive charts
- Automated investment recommendations
- Mobile-responsive design
- Progressive Web App (PWA) support
- Dark mode theme
- Multi-language support (i18n)

### 🤝 Contributing

We follow TDD principles for all new features and bug fixes:

1. **Write failing tests first** (Red)
2. **Implement minimal code to pass** (Green)
3. **Refactor for quality** (Refactor)

#### Commit Message Format

```
Test-[Component]: 
- [description] test added

Impl-[Component]: 
- [description] implementation added
 
Refactor-[Component]: 
- [description] improvement
 
```

### 📝 License

This project is proprietary software owned by Due Diligence Finance LLC. All rights reserved.

### 📞 Contact & Support

- **Technical Support**: To be added.
- **Business Inquiries**: To be added.
- **Documentation**: To be added.

### 🔒 Security

For security vulnerabilities, please email (To be added) directly. Do not create public issues for security problems.

### 🎓 Learning Resources

For developers new to the project:

1. Review the `Requirements.md` for detailed specifications
2. Check `project-notes.md` for development guidelines
3. Follow the TDD examples in the test directories
4. Refer to the status checklist for implementation progress

---

**© 2025 Due Diligence Finance LLC. Building trust through technology.**
