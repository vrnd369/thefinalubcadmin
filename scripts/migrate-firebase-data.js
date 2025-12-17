/**
 * Firebase Data Migration Script
 * 
 * This script migrates data from your old Firebase project to the new one.
 * 
 * Usage:
 * 1. Update OLD_PROJECT_CONFIG with your old Firebase credentials
 * 2. Run: node scripts/migrate-firebase-data.js
 * 
 * Collections to migrate:
 * - homeSections
 * - aboutSections
 * - brands
 * - categories
 * - products
 * - brandPages
 * - navigation
 * - contactPage
 * - careersPage
 * - header
 * - footer
 * - images
 * - videos
 * - formSubmissions
 * - formSubmissionFiles
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';

// Load environment variables (for Node.js scripts)
// Note: This script uses ES modules. Environment variables should be set in .env file
// For Node.js scripts, you can use dotenv package: npm install dotenv
// Or set environment variables directly in your shell before running the script

// Simple environment variable loader (works without dotenv if vars are set in shell)
// If dotenv is installed, uncomment the following lines:
// import dotenv from 'dotenv';
// dotenv.config();

// OLD Firebase Project Configuration (from environment variables)
const OLD_FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_OLD_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_OLD_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_OLD_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_OLD_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_OLD_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_OLD_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_OLD_FIREBASE_MEASUREMENT_ID
};

// NEW Firebase Project Configuration (from environment variables)
const NEW_FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Validate configuration
if (!OLD_FIREBASE_CONFIG.apiKey || !OLD_FIREBASE_CONFIG.projectId) {
  console.error('❌ OLD Firebase configuration is missing. Please check your .env file.');
  console.error('Required: REACT_APP_OLD_FIREBASE_* variables');
  process.exit(1);
}

if (!NEW_FIREBASE_CONFIG.apiKey || !NEW_FIREBASE_CONFIG.projectId) {
  console.error('❌ NEW Firebase configuration is missing. Please check your .env file.');
  console.error('Required: REACT_APP_FIREBASE_* variables');
  process.exit(1);
}

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
  'homeSections',
  'aboutSections',
  'brands',
  'categories',
  'products',
  'brandPages',
  'navigation',
  'contactPage',
  'careersPage',
  'header',
  'footer',
  'images',
  'videos',
  'formSubmissions',
  'formSubmissionFiles'
];

// Initialize Firebase apps
const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old');
const newApp = initializeApp(NEW_FIREBASE_CONFIG, 'new');

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);

/**
 * Migrate a single collection
 */
async function migrateCollection(collectionName) {
  console.log(`\n📦 Migrating collection: ${collectionName}`);
  
  try {
    // Get all documents from old project
    const snapshot = await getDocs(collection(oldDb, collectionName));
    const documents = snapshot.docs;
    
    if (documents.length === 0) {
      console.log(`   ⚠️  No documents found in ${collectionName}`);
      return { success: true, count: 0 };
    }
    
    console.log(`   📄 Found ${documents.length} documents`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Migrate each document
    for (const docSnap of documents) {
      try {
        const data = docSnap.data();
        
        // Add document to new project
        await addDoc(collection(newDb, collectionName), {
          ...data,
          // Preserve original document ID if needed (optional)
          // originalId: docSnap.id,
          migratedAt: new Date().toISOString()
        });
        
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`   ✅ Migrated ${successCount}/${documents.length} documents...`);
        }
      } catch (error) {
        console.error(`   ❌ Error migrating document ${docSnap.id}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`   ✅ Successfully migrated ${successCount} documents`);
    if (errorCount > 0) {
      console.log(`   ⚠️  ${errorCount} documents failed to migrate`);
    }
    
    return { success: true, count: successCount, errors: errorCount };
  } catch (error) {
    console.error(`   ❌ Error migrating collection ${collectionName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Migrate single document collections (like contactPage, careersPage, etc.)
 */
async function migrateSingleDocumentCollection(collectionName, docId = 'default') {
  console.log(`\n📦 Migrating single document collection: ${collectionName}`);
  
  try {
    const docRef = doc(oldDb, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      console.log(`   ⚠️  Document ${docId} not found in ${collectionName}`);
      return { success: true, count: 0 };
    }
    
    const data = docSnap.data();
    
    // Add to new project
    await addDoc(collection(newDb, collectionName), {
      ...data,
      migratedAt: new Date().toISOString()
    });
    
    console.log(`   ✅ Successfully migrated ${collectionName}`);
    return { success: true, count: 1 };
  } catch (error) {
    console.error(`   ❌ Error migrating ${collectionName}:`, error.message);
    return { success: false, count: 0, error: error.message };
  }
}

/**
 * Main migration function
 */
async function migrateAllData() {
  console.log('🚀 Starting Firebase Data Migration');
  console.log('=====================================');
  console.log(`📤 Source: ${OLD_FIREBASE_CONFIG.projectId}`);
  console.log(`📥 Destination: ${NEW_FIREBASE_CONFIG.projectId}`);
  console.log('=====================================\n');
  
  const results = {};
  
  // Migrate regular collections
  for (const collectionName of COLLECTIONS_TO_MIGRATE) {
    // Skip single document collections (handle separately)
    if (['contactPage', 'careersPage', 'header', 'footer'].includes(collectionName)) {
      continue;
    }
    
    const result = await migrateCollection(collectionName);
    results[collectionName] = result;
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Migrate single document collections
  const singleDocCollections = [
    { name: 'contactPage', docId: 'default' },
    { name: 'careersPage', docId: 'default' },
    { name: 'header', docId: 'header-config' },
    { name: 'footer', docId: 'default' }
  ];
  
  for (const { name, docId } of singleDocCollections) {
    const result = await migrateSingleDocumentCollection(name, docId);
    results[name] = result;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Print summary
  console.log('\n\n📊 Migration Summary');
  console.log('=====================================');
  
  let totalMigrated = 0;
  let totalErrors = 0;
  
  for (const [collectionName, result] of Object.entries(results)) {
    if (result.success) {
      console.log(`✅ ${collectionName}: ${result.count} documents`);
      totalMigrated += result.count;
      if (result.errors) {
        totalErrors += result.errors;
      }
    } else {
      console.log(`❌ ${collectionName}: Failed - ${result.error}`);
      totalErrors++;
    }
  }
  
  console.log('=====================================');
  console.log(`✅ Total documents migrated: ${totalMigrated}`);
  if (totalErrors > 0) {
    console.log(`⚠️  Total errors: ${totalErrors}`);
  }
  console.log('\n🎉 Migration completed!');
}

// Run migration
migrateAllData()
  .then(() => {
    console.log('\n✅ Migration script finished successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });

