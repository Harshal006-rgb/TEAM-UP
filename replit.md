# Overview

Team-Up is a modern full-stack web application that facilitates team formation and collaboration for hackathons, projects, and competitions. The platform enables users to discover like-minded teammates based on skills, interests, and goals. The application features secure user authentication, comprehensive profile management, connection request system, and real-time collaboration tools. Users can sign up, create profiles, send/accept/reject connection requests, and manage their professional network through an intuitive interface with smooth animations and modern design.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application follows a traditional multi-page architecture with separate HTML files for different sections. The frontend uses vanilla JavaScript with a component-based approach through classes like `ProfileManager` for handling user interactions and state management. CSS styling implements a modern gradient-based design with glassmorphism effects and responsive layouts.

## Backend Architecture
The backend is built with Express.js following a RESTful API pattern with comprehensive endpoints for user management and connection handling. The server provides static file serving, secure user authentication with bcrypt password hashing, and complete connection request management. The architecture uses in-memory storage for demo purposes with a fully functional API that includes endpoints for signup, login, connection requests, acceptance/rejection, and user discovery. The system includes proper error handling, data validation, and security measures.

## Authentication System
User authentication is implemented using bcryptjs for secure password hashing and session-based authentication. The system provides complete signup and login functionality with email-based user identification. User sessions are managed through browser sessionStorage, maintaining login states across page navigation. The authentication flow includes proper error handling, duplicate email prevention, and secure password storage. After successful login, users are redirected to their profile page where they can manage connections.

## Connection Management System
The application features a comprehensive connection management system with three distinct states: Accepted (mutual connections), Pending (incoming requests requiring response), and Sent (outgoing requests awaiting response). Users can send connection requests, accept/reject incoming requests, and manage their professional network through tabbed interfaces. The system includes notification badges for new requests, real-time updates, and smooth user interactions. Connection data is managed through RESTful API endpoints with proper state management.

## Client-Side State Management
The frontend manages user state through sessionStorage for persistence across pages and in-memory JavaScript objects for real-time data manipulation. Profile and connection data are cached locally and synchronized with the server through API calls.

## UI/UX Design Patterns
The interface implements a modern design system with gradient backgrounds, glassmorphism effects, animated Three.js particle backgrounds, and fully responsive layouts. The application uses tab-based navigation for connection management, modal-style forms for user interactions, and real-time notification system. Visual feedback is provided through animated transitions, notification badges, status indicators, and dynamic content updates. The design maintains consistency across all pages with a cohesive color scheme and typography.

# External Dependencies

## Core Backend Dependencies
- **Express.js** - Web application framework for Node.js providing routing and middleware support
- **bcryptjs** - Password hashing library for secure authentication
- **cors** - Cross-Origin Resource Sharing middleware for API access
- **mongoose** - MongoDB object modeling for Node.js (planned database integration)

## Planned Database Integration
- **MongoDB** - Document-based database for storing user profiles, connections, and team data (schema defined but not yet connected)

## Frontend Technologies
- **Vanilla JavaScript** - Client-side scripting without additional frameworks
- **HTML5 Canvas** - For animated background effects
- **CSS3** - Modern styling with gradients, blur effects, and responsive design

## Development Tools
- **Node.js** - Runtime environment for the backend server
- **npm** - Package management for dependencies

The application is structured to easily integrate additional services like email notifications, file storage, or real-time messaging systems as the platform scales.