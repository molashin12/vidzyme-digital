# SssS - UGC Video Generation Platform

SssS is an automated UGC (User-Generated Content) platform that allows users to create professional-style ad videos from product images using AI technology.

## Features

- **User Authentication**: Secure sign-up and login with Firebase Auth
- **Product Image Upload**: Easy drag-and-drop image upload with validation
- **AI Video Generation**: Automated video creation with customizable parameters
- **Video Configuration**: Choose aspect ratio, duration, and number of videos
- **Video Library**: Manage and download generated videos
- **Usage Tracking**: Monthly limits and usage statistics
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live status updates during video generation

## Tech Stack

- **Frontend**: React 18, Material-UI, React Router
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **Deployment**: Firebase Hosting
- **Video Processing**: Cloud Functions with external API integration

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI
- Firebase project with enabled services

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Vidzyme-digital
```

2. Install dependencies:
```bash
npm install
```

3. Install Firebase Functions dependencies:
```bash
cd functions
npm install
cd ..
```

4. Configure Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, Storage, and Functions
   - Update `src/config/firebase.js` with your Firebase configuration

5. Deploy Firestore rules and indexes:
```bash
firebase deploy --only firestore
```

6. Deploy Firebase Functions:
```bash
firebase deploy --only functions
```

7. Start the development server:
```bash
npm start
```

### Firebase Configuration

Update `src/config/firebase.js` with your Firebase project configuration:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.js
│   │   └── Register.js
│   ├── Dashboard/
│   │   └── Dashboard.js
│   ├── Navigation/
│   │   └── Navbar.js
│   ├── VideoGenerator/
│   │   └── VideoGenerator.js
│   └── VideoLibrary/
│       └── VideoLibrary.js
├── contexts/
│   └── AuthContext.js
├── config/
│   └── firebase.js
├── App.js
├── App.css
├── index.js
└── index.css

functions/
├── index.js
├── package.json
└── .eslintrc.js

public/
├── index.html
├── manifest.json
└── favicon.svg
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run deploy` - Deploy to Firebase Hosting
- `npm run functions:serve` - Start Firebase Functions emulator
- `npm run functions:deploy` - Deploy Firebase Functions

## Features Overview

### User Authentication
- Email/password authentication
- User profile management
- Protected routes

### Video Generation
- Product image upload (max 10MB)
- Custom prompts for video content
- Configurable aspect ratios (16:9, 9:16, 1:1)
- Variable duration (15-60 seconds)
- Multiple video generation
- Style selection (UGC, Professional, etc.)

### Video Management
- Real-time generation status
- Video library with search and filters
- Download functionality
- Thumbnail generation
- Usage statistics

### Monthly Limits
- Configurable monthly video limits
- Usage tracking and display
- Limit enforcement

## API Integration

The platform is designed to integrate with external video generation APIs. The current implementation includes placeholder functions that can be replaced with actual API calls to services like:

- Runway ML
- Stable Video Diffusion
- Pika Labs
- Custom AI video generation services

## Mobile App Compatibility

The project is structured to be easily converted to a mobile application using React Native:

- Shared business logic in contexts
- Firebase backend compatibility
- Component-based architecture
- Responsive design patterns

## Deployment

### Firebase Hosting

1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

### Environment Variables

For production deployment, ensure all Firebase configuration values are properly set and secure.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.