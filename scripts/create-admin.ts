import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { config } from 'dotenv';
import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Load environment variables
config();

const SERVICE_ACCOUNT_PATH = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './service-account.json';

function prompt(question: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('\n🔧 Timesheet Admin User Setup\n');

  // Check for service account file
  const serviceAccountPath = resolve(SERVICE_ACCOUNT_PATH);
  if (!existsSync(serviceAccountPath)) {
    console.error('❌ Service account file not found:', serviceAccountPath);
    console.log('\nTo get your service account key:');
    console.log('1. Go to Firebase Console → Project Settings → Service accounts');
    console.log('2. Click "Generate new private key"');
    console.log('3. Save the file as "service-account.json" in the project root');
    console.log('\nOr set FIREBASE_SERVICE_ACCOUNT_PATH in .env to point to your key file.\n');
    process.exit(1);
  }

  // Load service account
  let serviceAccount: ServiceAccount;
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf-8');
    serviceAccount = JSON.parse(fileContent);
  } catch (error) {
    console.error('❌ Failed to read service account file:', error);
    process.exit(1);
  }

  // Initialize Firebase Admin
  const app = initializeApp({
    credential: cert(serviceAccount),
  });

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Get user details
  const email = await prompt('Email: ');
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  const password = await prompt('Password (min 6 characters): ');
  if (!password || password.length < 6) {
    console.error('❌ Password must be at least 6 characters');
    process.exit(1);
  }

  const displayName = await prompt('Display Name: ');
  if (!displayName) {
    console.error('❌ Display name is required');
    process.exit(1);
  }

  console.log('\nCreating admin user...');

  try {
    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    console.log('✅ Created Firebase Auth user:', userRecord.uid);

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      email,
      displayName,
      role: 'admin',
      createdAt: FieldValue.serverTimestamp(),
    });

    console.log('✅ Created Firestore user document');
    console.log('\n🎉 Admin user created successfully!\n');
    console.log('You can now log in with:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: (the password you entered)\n`);
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/email-already-exists') {
      console.error('❌ A user with this email already exists');
    } else {
      console.error('❌ Failed to create user:', err.message);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
