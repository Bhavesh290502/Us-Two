# How to Lock Down Your App (Top Notch Security)

You are absolutely right! Currently, anyone who finds your site could sign up.

Since this is a private app for just **Us Two**, we need to close the door after you both enter.

## The Solution: Disable Signups

The most secure and easiest way to prevent strangers from accessing your app is to **disable new signups** in Supabase after you and your partner have created your accounts.

### Step-by-Step Instructions:

1.  **Both of you Sign Up:**
    *   Go to your live app URL (or localhost).
    *   Create an account for yourself.
    *   Create an account for your partner (or have them do it).
    *   **Verify** that you can both log in and see the dashboard.

2.  **Go to Supabase Dashboard:**
    *   Log in to [supabase.com](https://supabase.com).
    *   Open your project.

3.  **Disable Signups:**
    *   Navigate to **Authentication** (icon on the left) -> **Providers**.
    *   Click on **Email** (it should be enabled).
    *   **Uncheck** the box that says **"Enable Signups"**.
    *   Click **Save**.

### What this does:
*   **Existing Users (You Two):** Can still log in with your email and password perfectly fine.
*   **New Users (Strangers):** Will get an error if they try to sign up. The door is locked! 🔒

## Extra Security Layer (Optional)

If you want to be *extremely* paranoid, you can also run this SQL command in your Supabase SQL Editor to strictly enforce that only your specific emails can access data, even if they somehow bypassed the signup restriction.

Replace `your@email.com` and `partner@email.com` with your actual emails.

```sql
-- Create a function to check if the user is one of the couple
CREATE OR REPLACE FUNCTION auth.is_allowed_user()
RETURNS boolean AS $$
BEGIN
  RETURN (
    auth.jwt() ->> 'email' IN ('your@email.com', 'partner@email.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update your policies to use this function
-- Example for 'chat' table (you'd need to do this for all tables)
DROP POLICY IF EXISTS "Allow all for authenticated users" ON chat;
CREATE POLICY "Restrict to couple only" ON chat
FOR ALL USING (auth.role() = 'authenticated' AND auth.is_allowed_user());
```

**Recommendation:** The "Disable Signups" method (Step 1-3) is usually sufficient and much easier to manage!
