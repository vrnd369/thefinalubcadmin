# Environment Variables Setup Guide

This project uses environment variables to store sensitive credentials. Follow these steps to set up your environment.

## Quick Setup

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file** and add your Firebase credentials:
   ```env
   REACT_APP_FIREBASE_API_KEY=your_actual_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_actual_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_actual_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_actual_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
   REACT_APP_FIREBASE_APP_ID=your_actual_app_id
   REACT_APP_FIREBASE_MEASUREMENT_ID=your_actual_measurement_id
   ```

3. **For migration scripts** (optional, only if you need to migrate data):
   ```env
   REACT_APP_OLD_FIREBASE_API_KEY=old_project_api_key
   REACT_APP_OLD_FIREBASE_AUTH_DOMAIN=old_project_auth_domain
   REACT_APP_OLD_FIREBASE_PROJECT_ID=old_project_id
   REACT_APP_OLD_FIREBASE_STORAGE_BUCKET=old_project_storage_bucket
   REACT_APP_OLD_FIREBASE_MESSAGING_SENDER_ID=old_project_sender_id
   REACT_APP_OLD_FIREBASE_APP_ID=old_project_app_id
   REACT_APP_OLD_FIREBASE_MEASUREMENT_ID=old_project_measurement_id
   ```

## Getting Your Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ next to "Project Overview"
4. Select "Project settings"
5. Scroll down to "Your apps" section
6. Click on the web app (</>) icon or create a new web app
7. Copy the configuration values

## Environment Variables Reference

### Current Firebase Project (Required)
- `REACT_APP_FIREBASE_API_KEY` - Firebase API Key
- `REACT_APP_FIREBASE_AUTH_DOMAIN` - Firebase Auth Domain
- `REACT_APP_FIREBASE_PROJECT_ID` - Firebase Project ID
- `REACT_APP_FIREBASE_STORAGE_BUCKET` - Firebase Storage Bucket
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` - Firebase Messaging Sender ID
- `REACT_APP_FIREBASE_APP_ID` - Firebase App ID
- `REACT_APP_FIREBASE_MEASUREMENT_ID` - Firebase Analytics Measurement ID (optional)

### Old Firebase Project (Optional - for migration only)
- `REACT_APP_OLD_FIREBASE_API_KEY` - Old project API Key
- `REACT_APP_OLD_FIREBASE_AUTH_DOMAIN` - Old project Auth Domain
- `REACT_APP_OLD_FIREBASE_PROJECT_ID` - Old project Project ID
- `REACT_APP_OLD_FIREBASE_STORAGE_BUCKET` - Old project Storage Bucket
- `REACT_APP_OLD_FIREBASE_MESSAGING_SENDER_ID` - Old project Messaging Sender ID
- `REACT_APP_OLD_FIREBASE_APP_ID` - Old project App ID
- `REACT_APP_OLD_FIREBASE_MEASUREMENT_ID` - Old project Measurement ID

## Important Notes

⚠️ **Never commit `.env` file to version control!**

- The `.env` file is already in `.gitignore`
- Only commit `.env.example` (which contains placeholder values)
- Each developer should create their own `.env` file locally
- For production hosting, set environment variables in your hosting platform's dashboard

## Hosting Platform Setup

### Netlify
1. Go to Site settings → Environment variables
2. Add each `REACT_APP_*` variable

### Vercel
1. Go to Project settings → Environment Variables
2. Add each `REACT_APP_*` variable for Production, Preview, and Development

### AWS Amplify / Other Platforms
1. Check your platform's documentation for setting environment variables
2. Add all `REACT_APP_*` variables

## Troubleshooting

**Error: "Firebase configuration is missing"**
- Make sure your `.env` file exists in the project root
- Verify all `REACT_APP_*` variables are set
- Restart your development server after creating/updating `.env`

**Migration script not working:**
- Install dotenv: `npm install dotenv`
- Make sure `.env` file is in the project root
- Verify old Firebase credentials are set if using migration

## Security Best Practices

1. ✅ Use environment variables for all credentials
2. ✅ Never commit `.env` files
3. ✅ Use different Firebase projects for development and production
4. ✅ Regularly rotate API keys if compromised
5. ✅ Use Firebase Security Rules to protect your data

