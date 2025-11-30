-- Enable Row Level Security on all tables
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE bucketlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdown ENABLE ROW LEVEL SECURITY;
ALTER TABLE letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE song ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Create policies to allow access only to authenticated users
-- This ensures that no one can access your data unless they are logged in

-- Memories
CREATE POLICY "Allow all for authenticated users" ON memories
FOR ALL USING (auth.role() = 'authenticated');

-- Bucket List
CREATE POLICY "Allow all for authenticated users" ON bucketlist
FOR ALL USING (auth.role() = 'authenticated');

-- Chat
CREATE POLICY "Allow all for authenticated users" ON chat
FOR ALL USING (auth.role() = 'authenticated');

-- Places
CREATE POLICY "Allow all for authenticated users" ON places
FOR ALL USING (auth.role() = 'authenticated');

-- Countdown
CREATE POLICY "Allow all for authenticated users" ON countdown
FOR ALL USING (auth.role() = 'authenticated');

-- Letters
CREATE POLICY "Allow all for authenticated users" ON letters
FOR ALL USING (auth.role() = 'authenticated');

-- Song
CREATE POLICY "Allow all for authenticated users" ON song
FOR ALL USING (auth.role() = 'authenticated');

-- Wishlist
CREATE POLICY "Allow all for authenticated users" ON wishlist
FOR ALL USING (auth.role() = 'authenticated');
