# How to Deploy "Us Two" to Vercel

Since your app uses Vite and Supabase, **Vercel** is the easiest and best free hosting option.

## Prerequisites
1.  **GitHub Account**: You need to push your code to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com) using your GitHub account.

## Step 1: Push Code to GitHub
1.  Initialize Git in your project folder (if not already done):
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    ```
2.  Create a new repository on GitHub.
3.  Link your local project to the GitHub repo and push:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/us-two.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy on Vercel
1.  Go to your **Vercel Dashboard** and click **"Add New..."** -> **"Project"**.
2.  Import the `us-two` repository you just created.
3.  **Configure Project**:
    *   **Framework Preset**: It should auto-detect "Vite".
    *   **Root Directory**: `./` (default).
4.  **Environment Variables** (IMPORTANT):
    *   Expand the "Environment Variables" section in Vercel.
    *   Add the following variables (copy values from your `src/supabase.js` file):
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
    *   *Note: Your code has a fallback to the hardcoded values, so it will work even if you skip this, but for security, you should eventually remove the hardcoded strings from `src/supabase.js` and rely only on these variables.*
5.  Click **Deploy**.

## Step 3: Update Supabase Authentication Settings
1.  Once deployed, Vercel will give you a domain (e.g., `https://us-two.vercel.app`).
2.  Go to your **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
3.  Add your new Vercel URL to the **Site URL** and **Redirect URLs**.
    *   This ensures that email confirmation links and redirects work correctly.

## Step 4: Share!
Send the link to your partner. They can now sign up and start using the app with you!
