# Resume-AI

An AI-powered resume optimization and job application management platform built with React, Firebase, and OpenAI.

## 🚀 Features

- **AI-Powered Resume Analysis**: Get ATS compatibility scores and improvement suggestions
- **Resume Tailoring**: Automatically optimize resumes for specific job descriptions
- **Cover Letter Generation**: Generate personalized cover letters with multiple tone options
- **Application Tracking**: Manage job applications with status tracking and analytics
- **Real-time Authentication**: Secure user management with Firebase Auth
- **Cloud Storage**: Scalable data storage with Firestore

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Firebase Functions, Firestore
- **Authentication**: Firebase Auth
- **AI**: OpenAI GPT-4o
- **Build Tool**: Vite
- **Hosting**: Firebase Hosting

## 📋 Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- OpenAI API key
- Firebase project

## ⚙️ Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable the following services:
   - **Authentication** (Email/Password provider)
   - **Firestore Database** (in production mode)
   - **Functions**
   - **Hosting**

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd Resume-AI

# Install main dependencies
npm install

# Install Firebase Functions dependencies
cd functions
npm install
cd ..
```

### 3. Environment Configuration

1. Copy the environment template:

```bash
cp env.example .env
```

2. Get your Firebase config from Project Settings > General > Your apps
3. Update `.env` with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

4. For Firebase Functions, create `functions/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

### 4. Firebase Initialization

```bash
# Login to Firebase (if not already)
firebase login

# Initialize Firebase in your project
firebase use your_project_id

# Deploy Firestore rules and indexes
firebase deploy --only firestore
```

### 5. Development

```bash
# Start the development server (frontend)
npm run dev

# In another terminal, start Firebase emulators (backend)
npm run functions:dev
```

The app will be available at `http://localhost:5173` and Firebase Functions at `http://localhost:5001`.

### 6. Production Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 🔧 Available Scripts

### Root Directory

- `npm run dev` - Start frontend development server
- `npm run build` - Build for production
- `npm run functions:dev` - Start Firebase emulators
- `npm run functions:deploy` - Deploy only functions

### Functions Directory (`cd functions`)

- `npm run build` - Compile TypeScript functions
- `npm run serve` - Build and start emulators
- `npm run deploy` - Deploy functions to Firebase

## 📁 Project Structure

```
Resume-AI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and configurations
│   │   └── App.tsx         # Main app component
├── functions/              # Firebase Functions
│   ├── src/
│   │   ├── index.ts        # Main functions entry
│   │   └── openai.ts       # OpenAI integration
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Data models and validation
├── firebase.json           # Firebase configuration
├── firestore.rules         # Database security rules
└── firestore.indexes.json  # Database indexes
```

## 🔒 Security Features

- **Firebase Auth Integration**: Secure user authentication
- **Firestore Security Rules**: Database-level access control
- **Function Authentication**: Protected API endpoints
- **Type-safe Validation**: Zod schema validation

## 🤖 AI Features

### Resume Analysis

- ATS compatibility scoring
- Keyword optimization suggestions
- Missing skills identification
- Industry-specific recommendations

### Resume Tailoring

- Job-specific optimization
- Keyword matching
- Professional formatting preservation
- Field-specific terminology

### Cover Letter Generation

- Multiple tone options (professional, enthusiastic, conversational, formal)
- Company-specific personalization
- ATS-friendly formatting
- Relevant experience highlighting

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Functions not working locally**

   ```bash
   # Make sure you're in the right directory and authenticated
   firebase login
   firebase use your_project_id
   cd functions && npm install
   ```

2. **Environment variables not loading**

   - Ensure `.env` file is in the root directory
   - Restart the development server after changes
   - Check that variables start with `VITE_` for client-side access

3. **OpenAI API errors**

   - Verify your OpenAI API key is correct
   - Check your OpenAI account has sufficient credits
   - Ensure the key is set in `functions/.env`

4. **Firestore permission errors**
   - Check your Firestore rules are deployed
   - Ensure user is authenticated
   - Verify the security rules match your data structure

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review Firebase and OpenAI documentation
