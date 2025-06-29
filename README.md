# Configuration Management System

A full-stack configuration management application that allows administrators to manage app configuration parameters through a web panel and serves these configurations to mobile applications via REST API. Built with Vue.js 3 frontend and Node.js backend, utilizing Firebase for authentication and Firestore for data storage.

## 🚀 Live Demo

- **Admin Panel**: https://config-management-1.onrender.com/
- **API Base URL**: https://config-management-6na0.onrender.com/

### Demo Credentials

- **Email**: `test@test.com`
- **Password**: `test123`

## 📋 Features

### Core Functionality

- ✅ **User Authentication**: Firebase Auth integration with secure login/logout
- ✅ **Configuration Management**: CRUD operations for app configuration parameters
- ✅ **Real-time Updates**: Live configuration updates with conflict resolution
- ✅ **Mobile API**: RESTful API for mobile app configuration consumption
- ✅ **Responsive Design**: Mobile-first responsive UI that works across all devices

### Advanced Features

- 🌍 **Country-specific Configurations (Bonus)**: Serve different parameter values based on client country
- 🔒 **Concurrent Edit Protection**: Prevents conflicts when multiple users edit simultaneously
- ⚡ **Rate Limiting**: Different limits for admin panel and mobile API usage
- 🚀 **Caching Strategy**: In-memory caching with TTL for high-traffic optimization
- 🛡️ **Error Handling**: Comprehensive error handling with retry mechanisms
- 🔐 **Security**: Token-based authentication, CORS protection, and input validation

## 🏗️ System Architecture

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Vue.js 3     │    │    Node.js      │    │    Firebase     │
│    Frontend     │◄──►│    Backend      │◄──►│    Services     │
│                 │    │                 │    │                 │
│ • Admin Panel   │    │ • REST API      │    │ • Auth          │
│ • Responsive UI │    │ • Rate Limiting │    │ • Firestore     │
│ • State Mgmt    │    │ • Validation    │    │ • Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘

## 🛠️ Technology Stack

### Frontend

- **Vue.js 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with retry logic
- **Firebase SDK** - Authentication

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Firebase Admin SDK** - Server-side Firebase integration
- **Firestore** - NoSQL database
- **Express Rate Limit** - API rate limiting
- **Helmet** - Security middleware
- **Morgan** - HTTP request logging

## 🚦 API Endpoints

### Mobile API

GET /api/config/mobile?country=TR
Headers: x-api-token: your-api-token

### Admin API

### Authentication

### Health Check

## 📱 Country-specific Configuration

### The system supports serving different configuration values based on the client's country:

**Example**: Setting different latestVersion for Turkey (TR): - Default: "latestVersion": "2.1" - Turkey (TR): "latestVersion": "2.2"

## 🔒 Security Features

**🔐 Firebase Authentication**: Secure user authentication

**🎫 JWT Token Validation**: Server-side token verification

**🚦 Rate Limiting**: Protection against abuse

**🛡️ CORS Protection**: Cross-origin request security

**✅ Input Validation**: Request data validation

**🔒 Helmet Security**: HTTP headers security

**🗝️ API Token Protection**: Mobile API access control

## ⚡ Performance Optimizations

**🚀 In-memory Caching**: 5-minute TTL cache for configuration data

**🔗 Connection Pooling**: Efficient database connections

**🔄 Request Retry Logic**: Exponential backoff for failed requests

**📦 Lazy Loading**: Component-based code splitting

**⚡ Optimistic Updates**: Immediate UI feedback

## 🚀 Deployment Guide

### Prerequisites

Node.js 18+ and npm
Firebase project with Firestore enabled
Firebase service account key

Local Development Setup

1. Clone the repository

git clone <repository-url>
cd config-management

2. Install dependencies
   Install backend dependencies
   cd backend
   npm install

Install frontend dependencies
cd ../frontend
npm install

3. Firebase Configuration

Create a Firebase project at console.firebase.google.com
Enable Authentication (Email/Password)
Enable Firestore Database
Generate a service account key and save as backend/firebase-service-account.json

4. Environment Variables
   Backend (backend/.env):
   PORT=3000
   NODE_ENV=development
   FIREBASE_PROJECT_ID=your-project-id
   API_TOKEN=your-secure-api-token-here
   CORS_ORIGIN=http://localhost:5173

Production only (for deployment)
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

Frontend (frontend/.env):
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_BASE_URL=http://localhost:3000/api

5. Create Firebase User

Go to Firebase Console > Authentication > Users
Add a new user with email/password

6. Run the application

Start backend (from backend directory)

npm run dev

Start frontend (from frontend directory)

npm run dev

### 📖 Usage Guide

### Admin Panel Usage

Sign In: Use your Firebase credentials to access the admin panel
View Configurations: See all current configuration parameters
Edit Parameters: Click "Edit" to modify values and descriptions
Add Parameters: Use the bottom form to add new configuration keys
Manage Countries: Click "Countries" to set country-specific values
Delete Parameters: Remove unwanted configuration keys

## 📊 Code Architecture & Patterns

## Backend Architecture

**Singleton Pattern**: Firebase service initialization
**Service Layer**: Centralized business logic in ConfigService
**Middleware Pattern**: Authentication, validation, and error handling
**Repository Pattern**: Database abstraction through Firestore
**Factory Pattern**: Error response creation

## Frontend Architecture

### Composition API: Vue 3 composables for reusable logic

Store Pattern: Pinia for centralized state management
Component Architecture: Reusable, single-responsibility components
Service Layer: API abstraction with retry logic
Observer Pattern: Reactive state updates

### Design Principles

**Separation of Concerns**: Clear separation between layers
**DRY Principle**: Reusable components and utilities
**Single Responsibility**: Each module has one clear purpose
**Error Handling**: Comprehensive error boundaries and recovery
**Security First**: Authentication and authorization at every layer
