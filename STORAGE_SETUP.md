# How to Enable Large Video Uploads (Supabase Storage)

Storing large videos directly in the database is not possible. We need to use **Supabase Storage**, which is designed for files like photos and videos.

## Step 1: Create a Storage Bucket
1.  Go to your **Supabase Dashboard**.
2.  Click on the **Storage** icon (folder icon) on the left sidebar.
3.  Click **"New Bucket"**.
4.  Name the bucket: `memories` (all lowercase).
5.  **Public Access:** Toggle "Public bucket" to **ON**.
6.  Click **Save**.

## Step 2: Allow Uploads (Storage Policies)
1.  In the Storage page, click on the **Configuration** tab (or "Policies").
2.  You should see your `memories` bucket. Click **"New Policy"** (or "Policies" -> "New Policy").
3.  Choose **"For full customization"**.
4.  **Policy Name:** `Allow Authenticated Uploads`.
5.  **Allowed Operations:** Check **INSERT**, **UPDATE**, **SELECT**, **DELETE**.
6.  **Target roles:** Select `authenticated`.
7.  Click **Review** and **Save**.

*(Note: Since we made the bucket "Public", reading files is already allowed, but we need this policy to allow you to UPLOAD files).*

## Step 3: That's it!
Once you've done this, the app will automatically start using this bucket to store your videos and photos. You can now upload much larger files (up to 50MB or more depending on your Supabase settings)!
