# Timesheet Application

A modern, responsive React-based timesheet application with Firebase backend for tracking work hours and activities.

## Features

### Core Features
- **Time Tracking**: Log work hours with start time, optional end time, activity type, and notes
- **In-Progress Entries**: Start tracking time without knowing the end time; add end time later
- **Date Navigation**: Easy navigation between dates with quick-select options
- **Real-time Totals**: Automatic calculation of daily hours worked (excluding in-progress entries)

### User Management
- **Email/Password Authentication**: Secure login via Firebase Auth
- **Role-based Access Control**: Admin and User roles with different permissions
- **User CRUD Operations**: Admins can create, edit, and delete user accounts

### Activity Management
- **Dynamic Activities**: Admins can add, edit, and delete activity types
- **Color Coding**: Each activity has a customizable color for easy identification
- **Default Activity**: "Meeting" is created by default; admins can add more

### Admin Dashboard
- **All Users View**: View time entries from all users in one place
- **User Filtering**: Filter entries by specific user
- **Edit/Delete Entries**: Admins can modify any user's time entries
- **Summary Cards**: Quick overview of hours per user

### Entry Editing Rules
- **In-Progress Entries**: Users can only add end time and notes (cannot change activity or start time, cannot delete)
- **Completed Entries**: Once an end time is set, only admins can edit/delete the entry
- **Date Restriction**: Users can only add new entries for today's date
- **Admin Override**: Admins can add/edit/delete any entries for any date, with full edit access

### Export & Reporting
- **PDF Export**: Professional PDF reports with company branding
- **CSV Export**: Spreadsheet-compatible export for further analysis
- **Date Range Selection**: Today, this week, this month, last month, or custom range
- **Report Types**:
  - **Detailed**: Individual time entries with all details
  - **Summary**: Daily totals grouped by user and activity
- **Filter by Users**: Select specific users or export all users
- **Filter by Activities**: Select specific activities or export all activities

### Responsive Design
- **Mobile-First**: Optimized for phones, tablets, and desktops
- **Touch-Friendly**: Large tap targets and swipe-friendly navigation
- **Adaptive Layout**: Cards on mobile, tables on desktop

## Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Backend | Firebase (Auth + Firestore) |
| PDF Generation | jsPDF + jspdf-autotable |
| Notifications | react-hot-toast |

## Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project with Authentication and Firestore enabled

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp .env.example .env

# 3. Add your Firebase config to .env (see Firebase Setup below)

# 4. Create first admin user
npm run create-admin

# 5. Start development server
npm run dev
```

## Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** and follow the wizard
3. Once created, click on your project to open it

### Step 2: Enable Authentication
1. In the left sidebar, click **Authentication**
2. Click **Get started**
3. Go to **Sign-in method** tab
4. Click **Email/Password**, toggle **Enable**, and click **Save**

### Step 3: Create Firestore Database
1. In the left sidebar, click **Firestore Database**
2. Click **Create database**
3. Select **Start in production mode**
4. Choose a location closest to your users
5. Click **Enable**

### Step 4: Deploy Security Rules

> **Important:** This step is required before login will work.

**Option A: Using Firebase CLI (Recommended)**
```bash
firebase deploy --only firestore:rules
```

**Option B: Manual via Firebase Console**
1. In Firestore Database, click the **Rules** tab
2. Copy the contents of [`firestore.rules`](./firestore.rules) and paste them
3. Click **Publish**

### Step 5: Get Firebase Config
1. Click the gear icon (Settings) → **Project settings**
2. Scroll down to **Your apps** section
3. Click the web icon (`</>`) to add a web app
4. Enter a nickname and click **Register app**
5. Copy the config values to your `.env` file

### Step 6: Create First Admin User

**Option A: Using the Setup Script (Recommended)**

1. Download your service account key:
   - Go to **Project Settings** → **Service accounts** tab
   - Click **Generate new private key**
   - Save as `service-account.json` in the project root

2. Run the setup script:
   ```bash
   npm run create-admin
   ```

3. Follow the prompts to enter email, password, and display name

4. Delete `service-account.json` after setup (sensitive credentials)

**Option B: Manual Setup via Firebase Console**

1. **Create user in Authentication:**
   - Go to **Authentication** → **Users** tab
   - Click **Add user**, enter email and password
   - Copy the **User UID**

2. **Create user document in Firestore:**
   - Go to **Firestore Database** → **Data** tab
   - Create collection `users`
   - Create document with ID = User UID
   - Add fields:
     | Field | Type | Value |
     |-------|------|-------|
     | `email` | string | User's email |
     | `displayName` | string | User's name |
     | `role` | string | `admin` |
     | `createdAt` | timestamp | Current time |

## Environment Variables

Create a `.env` file with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

## Firestore Data Structure

### Collections

#### `users`
Stores user accounts and roles.

| Field | Type | Description |
|-------|------|-------------|
| `email` | string | User's email address |
| `displayName` | string | User's display name |
| `role` | string | `admin` or `user` |
| `createdAt` | timestamp | Account creation date |
| `createdBy` | string | UID of admin who created the user |
| `updatedAt` | timestamp | Last update date |

#### `timeEntries`
Stores all time entries.

| Field | Type | Description |
|-------|------|-------------|
| `userId` | string | User's UID |
| `date` | string | Date in YYYY-MM-DD format |
| `activity` | string | Activity ID |
| `startTime` | string | Start time in HH:mm (UTC) |
| `endTime` | string? | End time in HH:mm (UTC) - optional, entry is "in progress" if not set |
| `notes` | string | Optional notes |
| `createdAt` | timestamp | Entry creation date |
| `updatedAt` | timestamp | Last update date |

#### `activities`
Stores available activity types.

| Field | Type | Description |
|-------|------|-------------|
| `label` | string | Activity display name |
| `color` | string | Hex color code (e.g., #10B981) |
| `createdAt` | timestamp | Creation date |
| `updatedAt` | timestamp | Last update date |

#### `settings`
Stores application settings (single document: `appConfig`).

| Field | Type | Description |
|-------|------|-------------|
| `allowUserEdits` | boolean | Whether users can edit/delete their existing entries (adding new entries for today is always allowed) |
| `updatedAt` | timestamp | Last update date |
| `updatedBy` | string | UID of admin who last updated settings |

### Security Rules

See [`firestore.rules`](./firestore.rules) for the complete security rules. Key permissions:

| Resource | User | Admin |
|----------|------|-------|
| Own time entries | Read, Create, Update, Delete | - |
| All time entries | - | Read, Update, Delete |
| Own user document | Read | - |
| All user documents | - | Read, Create, Update, Delete* |
| Activities | Read | Read, Create, Update, Delete |
| Settings | Read | Read, Write |

*Admins cannot delete themselves

## Project Structure

```
├── public/
│   └── logo.png              # App logo (favicon + header)
├── src/
│   ├── components/
│   │   ├── Header.tsx        # Navigation header with mobile menu
│   │   ├── ProtectedRoute.tsx # Route guard for auth
│   │   ├── TimeEntry.tsx     # Time entry display card
│   │   ├── TimeEntryForm.tsx # Time entry create/edit form
│   │   └── ExportModal.tsx   # Export configuration modal
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state management
│   ├── hooks/
│   │   └── useExport.ts      # Export functionality hook
│   ├── pages/
│   │   ├── Login.tsx         # Login page
│   │   ├── Dashboard.tsx     # User's timesheet view
│   │   ├── AdminDashboard.tsx # Admin view of all timesheets
│   │   ├── UserManagement.tsx # User CRUD page
│   │   ├── ActivityManagement.tsx # Activity CRUD page
│   │   └── AdminSettings.tsx # Admin settings page
│   ├── services/
│   │   ├── firebase.ts       # Firebase initialization
│   │   ├── auth.ts           # Authentication functions
│   │   ├── timesheet.ts      # Time entry CRUD
│   │   ├── activities.ts     # Activity CRUD
│   │   └── settings.ts       # App settings management
│   ├── utils/
│   │   ├── timezone.ts       # Timezone utilities
│   │   └── export/           # PDF/CSV export utilities
│   │       ├── types.ts
│   │       ├── dataTransformer.ts
│   │       ├── pdfExporter.ts
│   │       └── csvExporter.ts
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   ├── config/
│   │   └── activities.json   # Default activity (fallback)
│   ├── App.tsx               # Main app with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
└── scripts/
    └── create-admin.js       # Admin user creation script
```

## Usage Guide

### For Users

1. **Login**: Enter your email and password
2. **View Timesheet**: Your current day's entries are shown
3. **Log Time** (today only):
   - Select an activity from the dropdown
   - Set start time (use "Now" button for current time)
   - End time is optional - leave empty to mark as "In Progress"
   - Optionally add notes
   - Click "Log Time"
4. **Complete Entry**: Click the pencil icon on an in-progress entry to add end time and notes
   - Activity and start time cannot be changed
   - Once end time is added, the entry is locked
5. **Navigate Dates**: Use arrows or click the date to view entries for other days
   - Note: You can only add new entries for today's date

### For Admins

1. **View All Timesheets**:
   - Navigate to "All Timesheets" in the menu
   - Use the user filter to view specific users
   - Click on user summary cards to filter

2. **Manage Users**:
   - Navigate to "Users" in the menu
   - Click "Add User" to create new accounts
   - Click edit icon to modify user details
   - Click delete icon to remove users (cannot delete yourself)

3. **Manage Activities**:
   - Navigate to "Activities" in the menu
   - Click "Add Activity" to create new activity types
   - Choose from 8 preset colors
   - Edit or delete existing activities
   - Note: At least one activity must exist

4. **Export Reports**:
   - From Admin Dashboard, click "Export" button
   - Select date range (or use quick-select buttons)
   - Choose format: PDF or CSV
   - Choose type: Detailed (individual entries) or Summary (totals)
   - Filter by users: Select specific users or leave empty for all
   - Filter by activities: Select specific activities or leave empty for all
   - Click "Export" to download

5. **View Settings**:
   - Navigate to "Settings" in the menu
   - View information about entry editing rules:
     - Users can only add end time and notes to in-progress entries
     - Users cannot delete entries (only admins can)
     - Once an entry has an end time, only admins can modify it
     - Users can only add entries for today's date

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run create-admin` | Create first admin user |

## Testing

The project uses Jest and React Testing Library for unit testing.

### Test Structure

```
src/
├── components/__tests__/     # Component tests
├── hooks/__tests__/          # Hook tests
├── services/__tests__/       # Service tests
├── utils/__tests__/          # Utility function tests
└── test/
    ├── setup.ts              # Jest setup file
    └── __mocks__/            # Mock files for Firebase, etc.
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Troubleshooting

### "Missing or insufficient permissions" error
- Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- Verify user document exists with correct UID as document ID
- Check that `role` field is set to `admin` (lowercase)

### Login succeeds but redirects back to login
- User document may not exist in Firestore
- Document ID must match User UID exactly

### "The query requires an index" error
1. Click the link in the browser console error
2. Click **Create index** in Firebase Console
3. Wait for index to build (few minutes)

Or deploy all indexes:
```bash
firebase deploy --only firestore:indexes
```

### Activities not loading
- Check that `activities` collection exists in Firestore
- Verify security rules are deployed
- A default "Meeting" activity is created automatically if none exist

## Deployment

### Build for Production
```bash
npm run build
```

The output will be in the `dist/` directory.

### Deploy to Firebase Hosting
```bash
# Install Firebase CLI if needed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize hosting (if not already done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

### Environment Variables for Production
Ensure your production environment has all the `VITE_FIREBASE_*` variables set.

## License

MIT
