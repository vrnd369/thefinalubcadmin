import React, { useState } from 'react';
import AdminLayout from '../../components/AdminLayout/AdminLayout';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, doc, getDoc } from 'firebase/firestore';
import './DataMigration.css';

// Old Firebase Project Configuration (from environment variables)
const OLD_FIREBASE_CONFIG = {
  apiKey: process.env.REACT_APP_OLD_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_OLD_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_OLD_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_OLD_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_OLD_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_OLD_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_OLD_FIREBASE_MEASUREMENT_ID
};

// Collections to migrate
const COLLECTIONS_TO_MIGRATE = [
  { name: 'homeSections', label: 'Home Sections' },
  { name: 'aboutSections', label: 'About Sections' },
  { name: 'brands', label: 'Brands' },
  { name: 'categories', label: 'Categories' },
  { name: 'products', label: 'Products' },
  { name: 'brandPages', label: 'Brand Pages' },
  { name: 'navigation', label: 'Navigation' },
  { name: 'images', label: 'Images' },
  { name: 'videos', label: 'Videos' },
  { name: 'formSubmissions', label: 'Form Submissions' },
  { name: 'formSubmissionFiles', label: 'Form Files' }
];

// Single document collections
const SINGLE_DOC_COLLECTIONS = [
  { name: 'contactPage', docId: 'default', label: 'Contact Page' },
  { name: 'careersPage', docId: 'default', label: 'Careers Page' },
  { name: 'header', docId: 'header-config', label: 'Header Config' },
  { name: 'footer', docId: 'default', label: 'Footer Config' }
];

export default function DataMigration() {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState({});
  const [selectedCollections, setSelectedCollections] = useState(
    COLLECTIONS_TO_MIGRATE.map(c => c.name).concat(SINGLE_DOC_COLLECTIONS.map(c => c.name))
  );
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const toggleCollection = (collectionName) => {
    setSelectedCollections(prev =>
      prev.includes(collectionName)
        ? prev.filter(name => name !== collectionName)
        : [...prev, collectionName]
    );
  };

  const migrateCollection = async (collectionName, oldDb, newDb) => {
    try {
      const snapshot = await getDocs(collection(oldDb, collectionName));
      const documents = snapshot.docs;

      if (documents.length === 0) {
        return { success: true, count: 0, errors: 0 };
      }

      let successCount = 0;
      let errorCount = 0;

      for (const docSnap of documents) {
        try {
          const data = docSnap.data();
          await addDoc(collection(newDb, collectionName), {
            ...data,
            migratedAt: new Date().toISOString()
          });
          successCount++;
        } catch (err) {
          console.error(`Error migrating document ${docSnap.id}:`, err);
          errorCount++;
        }
      }

      return { success: true, count: successCount, errors: errorCount };
    } catch (error) {
      return { success: false, count: 0, errors: 0, error: error.message };
    }
  };

  const migrateSingleDocument = async (collectionName, docId, oldDb, newDb) => {
    try {
      const docRef = doc(oldDb, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        return { success: true, count: 0, errors: 0 };
      }

      const data = docSnap.data();
      await addDoc(collection(newDb, collectionName), {
        ...data,
        migratedAt: new Date().toISOString()
      });

      return { success: true, count: 1, errors: 0 };
    } catch (error) {
      return { success: false, count: 0, errors: 0, error: error.message };
    }
  };

  const handleMigration = async () => {
    if (selectedCollections.length === 0) {
      setError('Please select at least one collection to migrate');
      return;
    }

    setMigrating(true);
    setError(null);
    setResults(null);
    setProgress({});

    try {
      // Validate configurations
      if (!OLD_FIREBASE_CONFIG.apiKey || !OLD_FIREBASE_CONFIG.projectId) {
        throw new Error('Old Firebase configuration is missing. Please check your .env file.');
      }

      // New Firebase Project Configuration (from environment variables)
      const NEW_FIREBASE_CONFIG = {
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.REACT_APP_FIREBASE_APP_ID,
        measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
      };

      if (!NEW_FIREBASE_CONFIG.apiKey || !NEW_FIREBASE_CONFIG.projectId) {
        throw new Error('New Firebase configuration is missing. Please check your .env file.');
      }

      // Initialize Firebase apps
      const oldApp = initializeApp(OLD_FIREBASE_CONFIG, 'old-migration');
      const newApp = initializeApp(NEW_FIREBASE_CONFIG, 'new-migration');

      const oldDb = getFirestore(oldApp);
      const newDb = getFirestore(newApp);

      const migrationResults = {};

      // Migrate regular collections
      for (const collection of COLLECTIONS_TO_MIGRATE) {
        if (!selectedCollections.includes(collection.name)) {
          continue;
        }

        setProgress(prev => ({ ...prev, [collection.name]: 'Migrating...' }));

        const result = await migrateCollection(collection.name, oldDb, newDb);
        migrationResults[collection.name] = result;

        setProgress(prev => ({
          ...prev,
          [collection.name]: result.success
            ? `✅ ${result.count} documents migrated`
            : `❌ Failed: ${result.error}`
        }));

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Migrate single document collections
      for (const collection of SINGLE_DOC_COLLECTIONS) {
        if (!selectedCollections.includes(collection.name)) {
          continue;
        }

        setProgress(prev => ({ ...prev, [collection.name]: 'Migrating...' }));

        const result = await migrateSingleDocument(
          collection.name,
          collection.docId,
          oldDb,
          newDb
        );
        migrationResults[collection.name] = result;

        setProgress(prev => ({
          ...prev,
          [collection.name]: result.success
            ? `✅ Document migrated`
            : `❌ Failed: ${result.error}`
        }));

        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setResults(migrationResults);
    } catch (error) {
      console.error('Migration error:', error);
      setError(`Migration failed: ${error.message}`);
    } finally {
      setMigrating(false);
    }
  };

  const totalMigrated = results
    ? Object.values(results).reduce((sum, r) => sum + (r.count || 0), 0)
    : 0;

  return (
    <AdminLayout>
      <div className="data-migration-page">
        <h1>Firebase Data Migration</h1>
        <p className="migration-description">
          Migrate data from your old Firebase project (<strong>theubc-e055c</strong>) to your new project (<strong>theubc-bec27</strong>).
        </p>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className="migration-section">
          <h2>Select Collections to Migrate</h2>
          <div className="collections-grid">
            {COLLECTIONS_TO_MIGRATE.map(collection => (
              <label key={collection.name} className="collection-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection.name)}
                  onChange={() => toggleCollection(collection.name)}
                  disabled={migrating}
                />
                <span>{collection.label}</span>
              </label>
            ))}
            {SINGLE_DOC_COLLECTIONS.map(collection => (
              <label key={collection.name} className="collection-checkbox">
                <input
                  type="checkbox"
                  checked={selectedCollections.includes(collection.name)}
                  onChange={() => toggleCollection(collection.name)}
                  disabled={migrating}
                />
                <span>{collection.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="migration-actions">
          <button
            onClick={handleMigration}
            disabled={migrating || selectedCollections.length === 0}
            className="migrate-button"
          >
            {migrating ? 'Migrating...' : 'Start Migration'}
          </button>
        </div>

        {Object.keys(progress).length > 0 && (
          <div className="migration-progress">
            <h2>Migration Progress</h2>
            <ul>
              {Object.entries(progress).map(([collection, status]) => (
                <li key={collection}>
                  <strong>{collection}:</strong> {status}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results && (
          <div className="migration-results">
            <h2>Migration Results</h2>
            <div className="results-summary">
              <p>
                <strong>Total Documents Migrated:</strong> {totalMigrated}
              </p>
            </div>
            <table className="results-table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Status</th>
                  <th>Documents</th>
                  <th>Errors</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([collection, result]) => (
                  <tr key={collection}>
                    <td>{collection}</td>
                    <td>
                      {result.success ? (
                        <span className="success">✅ Success</span>
                      ) : (
                        <span className="error">❌ Failed</span>
                      )}
                    </td>
                    <td>{result.count || 0}</td>
                    <td>{result.errors || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="migration-info">
          <h3>Important Notes:</h3>
          <ul>
            <li>⚠️ This will add data to your new project. Existing data will not be overwritten.</li>
            <li>⚠️ Document IDs will be different in the new project.</li>
            <li>⚠️ Make sure Firestore rules are set up in the new project.</li>
            <li>✅ Migration is safe - it only adds data, doesn't delete anything.</li>
            <li>✅ You can run migration multiple times (may create duplicates).</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}

