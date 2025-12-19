-- Enable RLS for wishlist table
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create policy to allow access only to authenticated users
CREATE POLICY "Allow all for authenticated users" ON wishlist
FOR ALL USING (auth.role() = 'authenticated');
