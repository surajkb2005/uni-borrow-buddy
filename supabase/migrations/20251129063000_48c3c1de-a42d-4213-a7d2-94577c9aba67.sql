-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create Enum Types for Status
create type user_role as enum ('student', 'admin');
create type item_status as enum ('available', 'borrowed', 'maintenance', 'pending');

-- 3. Create Profiles Table (Extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text not null,
  student_id text not null unique,
  dob date not null,
  role user_role default 'student',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Clubs Table
create table public.clubs (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  admin_id uuid references public.profiles(id)
);

-- 5. Create Items Table
create table public.items (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  category text,
  status item_status default 'available',
  club_id uuid references public.clubs(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Create Requests Table
create table public.requests (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  item_id uuid references public.items(id) not null,
  status item_status default 'pending',
  request_date timestamp with time zone default timezone('utc'::text, now()) not null,
  return_due_date date,
  actual_return_date date
);

-- 7. Row Level Security (RLS) Policies
alter table profiles enable row level security;
alter table items enable row level security;
alter table requests enable row level security;
alter table clubs enable row level security;

-- Policies for Profiles
create policy "Public profiles are viewable by everyone" 
on profiles for select using (true);

create policy "Users can insert their own profile" 
on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile" 
on profiles for update using (auth.uid() = id);

-- Policies for Items
create policy "Items are viewable by everyone" 
on items for select using (true);

create policy "Only club admins can insert/update items" 
on items for all using (
  exists (
    select 1 from clubs 
    where clubs.id = items.club_id 
    and clubs.admin_id = auth.uid()
  )
);

-- Policies for Requests
create policy "Users can see their own requests" 
on requests for select using (auth.uid() = user_id);

create policy "Club admins can see requests for their items" 
on requests for select using (
  exists (
    select 1 from items 
    join clubs on items.club_id = clubs.id
    where items.id = requests.item_id 
    and clubs.admin_id = auth.uid()
  )
);

create policy "Users can create requests" 
on requests for insert with check (auth.uid() = user_id);

create policy "Admins can update request status" 
on requests for update using (
  exists (
    select 1 from items 
    join clubs on items.club_id = clubs.id
    where items.id = requests.item_id 
    and clubs.admin_id = auth.uid()
  )
);

-- Policies for Clubs
create policy "Clubs are viewable by everyone" 
on clubs for select using (true);

create policy "Only club admins can manage their clubs" 
on clubs for all using (auth.uid() = admin_id);

-- 8. Storage Bucket Setup
insert into storage.buckets (id, name, public) values ('item-images', 'item-images', true);

create policy "Public Access to Item Images" 
on storage.objects for select using ( bucket_id = 'item-images' );

create policy "Authenticated users can upload images" 
on storage.objects for insert with check ( bucket_id = 'item-images' and auth.role() = 'authenticated' );

-- 9. Create trigger for profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, student_id, dob)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'New User'),
    coalesce(new.raw_user_meta_data->>'student_id', new.email),
    coalesce((new.raw_user_meta_data->>'dob')::date, current_date)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();