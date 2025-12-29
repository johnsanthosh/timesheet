# Timesheet Application

A React-based timesheet application with Firebase backend for tracking work hours and activities.

## Features

- User authentication with email/password
- Role-based access control (Admin/User)
- Time entry logging with start/end times
- Configurable activities via JSON file
- Timezone support (configurable by admin)
- Admin dashboard with all users' timesheets and summary reports
- User management (admin-only)

## Tech Stack

- **Frontend**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+
- Firebase project with Authentication and Firestore enabled

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

### Step 4: Deploy Security Rules (Important!)
> **Note:** This step is required before login will work. Without these rules, you'll get "Missing or insufficient permissions" errors.

1. In Firestore Database, click the **Rules** tab
2. Replace the default rules with the contents of `firestore.rules` from this project:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if request.auth != null &&
        (request.auth.uid == userId || isAdmin());
      allow create, update: if isAdmin();
      allow delete: if false;
    }

    match /timeEntries/{entryId} {
      allow read: if request.auth != null &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    match /config/{configId} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }
  }
}
```

3. Click **Publish**

### Step 5: Get Firebase Config
1. Click the gear icon (Settings) → **Project settings**
2. Scroll down to **Your apps** section
3. Click the web icon (`</>`) to add a web app
4. Enter a nickname (e.g., "Timesheet App") and click **Register app**
5. Copy the config values shown (you'll need these for the `.env` file)

### Step 6: Create First Admin User

**Quick:** Use `npm run create-admin` (see Option A below)

#### Option A: Using the Setup Script (Recommended)

> **Note:** The `.env` file contains client credentials which can't create users with admin privileges. The script needs a service account key (admin credentials) to bypass security rules and create the first admin user in Firestore.

1. Download your service account key:
   - Go to **Firebase Console** → **Project Settings** (gear icon)
   - Click **Service accounts** tab
   - Click **Generate new private key**
   - Save the file as `service-account.json` in the project root

2. Run the setup script:
   ```bash
   npm run create-admin
   ```

3. Follow the prompts to enter email, password, and display name

4. Delete the `service-account.json` file after setup (it contains sensitive credentials and is already in `.gitignore`)

#### Option B: Manual Setup via Firebase Console

**6a. Create user in Firebase Authentication:**
1. Go to **Authentication** → **Users** tab
2. Click **Add user**
3. Enter email and password
4. Click **Add user**
5. **Copy the User UID** (the long string in the "User UID" column) - you'll need this!

**6b. Create user document in Firestore:**
1. Go to **Firestore Database** → **Data** tab
2. Click **Start collection**
3. For **Collection ID**, enter: `users`
4. For **Document ID**, paste the **User UID** you copied (not the email!)
5. Add the following fields:

| Field | Type | Value |
|-------|------|-------|
| `email` | string | The email you used |
| `displayName` | string | Your name (e.g., "Admin") |
| `role` | string | `admin` |
| `createdAt` | timestamp | Click the calendar icon and select current time |

6. Click **Save**

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

3. Fill in your Firebase configuration in `.env`:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

4. Create the first admin user:

```bash
# Download service account key first (see Step 6 above), then run:
npm run create-admin
```

Follow the prompts:
```
🔧 Timesheet Admin User Setup

Email: admin@example.com
Password (min 6 characters): ******
Display Name: Admin User

✅ Created Firebase Auth user: abc123...
✅ Created Firestore user document

🎉 Admin user created successfully!
```

5. Delete the `service-account.json` file after setup (it contains sensitive credentials)

6. Run the development server:

```bash
npm run dev
```

7. Log in with the admin email/password you created

## Troubleshooting

### "Missing or insufficient permissions" error
- Make sure you deployed the Firestore security rules (Step 4 above)
- Verify the user document in Firestore has the correct User UID as the document ID
- Check that the `role` field is set to `admin` (lowercase)

### Login succeeds but redirects back to login
- The user document may not exist in Firestore
- The document ID must match the User UID exactly (case-sensitive)

### "The query requires an index" error
Firestore requires composite indexes for queries with multiple fields. When you see this error:

1. Click the link provided in the browser console error message
2. Click **Create index** in Firebase Console
3. Wait for the index to build (can take a few minutes)

Alternatively, if you have Firebase CLI installed, you can deploy all indexes at once:
```bash
firebase deploy --only firestore:indexes
```

The required indexes are defined in `firestore.indexes.json`.

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── ProtectedRoute.tsx
│   ├── TimeEntry.tsx
│   └── TimeEntryForm.tsx
├── contexts/            # React contexts
│   ├── AuthContext.tsx
│   └── TimezoneContext.tsx
├── pages/               # Page components
│   ├── Login.tsx
│   ├── Dashboard.tsx
│   ├── AdminDashboard.tsx
│   └── UserManagement.tsx
├── services/            # Firebase services
│   ├── firebase.ts
│   ├── auth.ts
│   └── timesheet.ts
├── config/
│   └── activities.json  # Configurable activities
├── types/
│   └── index.ts         # TypeScript types
├── utils/
│   └── timezone.ts      # Timezone utilities
├── App.tsx
└── main.tsx
```

## Configuring Activities

Edit `src/config/activities.json` to customize available activities:

```json
{
  "activities": [
    { "id": "development", "label": "Development", "color": "#3B82F6" },
    { "id": "meeting", "label": "Meeting", "color": "#10B981" },
    { "id": "review", "label": "Code Review", "color": "#F59E0B" }
  ]
}
```

## Usage

### For Users
1. Log in with your credentials
2. Use the dashboard to log time entries for the current date
3. Select an activity, set start/end times, and optionally add notes
4. Navigate between dates to view/edit past entries

### For Admins
1. Access "All Timesheets" to view entries from all users
2. Use "Users" to create new user accounts
3. Click the settings icon to change the application timezone

## Adding a Logo

To add a logo to the header, place your logo image in the `public/` folder and update the `Header` component usage in your pages to pass the logo path:

```tsx
<Header logo="/your-logo.png" />
```
