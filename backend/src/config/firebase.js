// Firebase Admin SDK configuration
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './firebase-service-account.json';

let db = null;
let auth = null;

if (!admin.apps.length) {
  try {
    // Check if service account file exists
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(path.resolve(serviceAccountPath));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      db = admin.firestore();
      auth = admin.auth();
      console.log('✅ Firebase Admin SDK initialized successfully');
    } else {
      console.log('⚠️  Firebase Admin SDK not initialized. Service account file not found.');
      console.log('   Please download from: Firebase Console > Project Settings > Service Accounts');
      console.log('   Expected path:', path.resolve(serviceAccountPath));
    }
  } catch (error) {
    console.log('⚠️  Firebase Admin SDK initialization failed:', error.message);
    console.log('   Please check your service account key file.');
  }
}

module.exports = { admin, db, auth };