-- JUDGES TABLE
CREATE TABLE IF NOT EXISTS judges (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  name text NOT NULL,
  bio text NOT NULL,
  photo_url text,
  social_links jsonb DEFAULT '{}'::jsonb
);

ALTER TABLE judges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read judges" ON judges;
CREATE POLICY "Allow public read judges" ON judges FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert judges" ON judges;
CREATE POLICY "Allow public insert judges" ON judges FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update judges" ON judges;
CREATE POLICY "Allow public update judges" ON judges FOR UPDATE TO public USING (true);
DROP POLICY IF EXISTS "Allow public delete judges" ON judges;
CREATE POLICY "Allow public delete judges" ON judges FOR DELETE TO public USING (true);

-- Create the registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  dob date NOT NULL,
  address text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  why_compete text NOT NULL,
  holy_spirit_relation text NOT NULL,
  five_year_vision text NOT NULL,
  video_url text,
  receipt_url text,
  second_video_url text,
  current_stage text DEFAULT 'registration',
  live_audition_song text,
  live_audition_time timestamp with time zone,
  live_audition_score integer DEFAULT 0,
  live_audition_room_id text,
  judge_id uuid REFERENCES judges(id)
);

-- Enable Row Level Security (RLS) but allow inserts from anon
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous inserts" ON registrations;
CREATE POLICY "Allow anonymous inserts"
ON registrations
FOR INSERT
TO anon
WITH CHECK (true);

-- Create the storage bucket for auditions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('auditions', 'auditions', true)
ON CONFLICT (id) DO NOTHING;

-- Enable public access for the bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
TO public
USING ( bucket_id = 'auditions' );

-- Allow anonymous uploads to the 'auditions' bucket
DROP POLICY IF EXISTS "Allow anonymous uploads" ON storage.objects;
CREATE POLICY "Allow anonymous uploads"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK ( bucket_id = 'auditions' );

-- UPDATE EXSITING REGISTRATIONS TABLE
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS current_stage text DEFAULT 'registration',
ADD COLUMN IF NOT EXISTS video_url text,
ADD COLUMN IF NOT EXISTS second_video_url text, -- The missing column
ADD COLUMN IF NOT EXISTS live_audition_song text,
ADD COLUMN IF NOT EXISTS live_audition_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS live_audition_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS live_audition_room_id text,
ADD COLUMN IF NOT EXISTS judge_id uuid REFERENCES judges(id);

-- Add policies so admin can read/update (Since we can't easily set up Supabase Auth for Admin yet, we will rely on application-level password for the admin routes and use the Service Role key for admin API calls, or just allow public read/update for now if we don't have a service role key. A better approach is using the service_role key in server actions).
-- Assuming we use service_role key in the app/admin, we don't need to change RLS for anon. But we will allow reading just in case.
DROP POLICY IF EXISTS "Allow public read" ON registrations;
CREATE POLICY "Allow public read" ON registrations FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public update" ON registrations;
CREATE POLICY "Allow public update" ON registrations FOR UPDATE TO public USING (true);


-- GALLERY TABLE
CREATE TABLE IF NOT EXISTS gallery (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  type text NOT NULL, -- 'image' or 'video'
  url text NOT NULL,
  caption text,
  is_featured boolean DEFAULT false
);

ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
-- Ensure is_featured column exists
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;
DROP POLICY IF EXISTS "Allow public read gallery" ON gallery;
CREATE POLICY "Allow public read gallery" ON gallery FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert gallery" ON gallery;
CREATE POLICY "Allow public insert gallery" ON gallery FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update gallery" ON gallery;
CREATE POLICY "Allow public update gallery" ON gallery FOR UPDATE TO public USING (true);
DROP POLICY IF EXISTS "Allow public delete gallery" ON gallery;
CREATE POLICY "Allow public delete gallery" ON gallery FOR DELETE TO public USING (true);


-- ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  type text DEFAULT 'update' -- 'update', 'event', 'result'
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read announcements" ON announcements;
CREATE POLICY "Allow public read announcements" ON announcements FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert announcements" ON announcements;
CREATE POLICY "Allow public insert announcements" ON announcements FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update announcements" ON announcements;
CREATE POLICY "Allow public update announcements" ON announcements FOR UPDATE TO public USING (true);
DROP POLICY IF EXISTS "Allow public delete announcements" ON announcements;
CREATE POLICY "Allow public delete announcements" ON announcements FOR DELETE TO public USING (true);


-- Create the storage bucket for gallery if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Access Gallery" ON storage.objects;
CREATE POLICY "Public Access Gallery" ON storage.objects FOR SELECT TO public USING ( bucket_id = 'gallery' );
DROP POLICY IF EXISTS "Allow anonymous uploads Gallery" ON storage.objects;
CREATE POLICY "Allow anonymous uploads Gallery" ON storage.objects FOR INSERT TO anon WITH CHECK ( bucket_id = 'gallery' );
DROP POLICY IF EXISTS "Allow anonymous delete Gallery" ON storage.objects;
CREATE POLICY "Allow anonymous delete Gallery" ON storage.objects FOR DELETE TO anon USING ( bucket_id = 'gallery' );
