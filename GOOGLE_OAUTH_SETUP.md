# Google OAuth Setup Guide

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: GoXpress POS
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173`
     - `http://localhost:5000`
   - **Authorized redirect URIs**:
     - `http://localhost:5000/api/auth/google/callback`

5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 3: Update Backend .env

Add these to `backend/.env`:

```
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
API_URL=http://localhost:5000/api
```

## Step 4: Run Database Migration

Run the SQL migration to add google_id column:

```bash
# Connect to your database and run:
psql your_database_url -f backend/sql/009_add_google_id.sql
```

Or run it manually in your database:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
```

## Step 5: Restart Backend

```bash
cd backend
npm start
```

## How It Works

1. User clicks "Sign up with Google" button
2. Redirected to Google login page
3. After authentication, Google redirects back to `/api/auth/google/callback`
4. Backend creates/updates user account
5. User is redirected to the welcome page
6. User can access the dashboard

## Testing

1. Click "Sign up with Google" on the signup page
2. Login with your Google account
3. You'll be redirected to the welcome page
4. Then to the dashboard

## Notes

- Users who sign up with Google don't need a password
- Username is auto-generated from email
- Default role is "cashier" (can be changed later)
