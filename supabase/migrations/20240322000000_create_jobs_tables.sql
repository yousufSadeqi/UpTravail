-- Create jobs table
CREATE TABLE public.jobs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL,
    description TEXT NOT NULL,
    budget_type TEXT NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
    budget_amount DECIMAL(10,2) NOT NULL,
    location JSONB NOT NULL,
    required_skills TEXT[] DEFAULT '{}',
    attachments TEXT[] DEFAULT '{}',
    timeline TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update the RLS policies for jobs table
DROP POLICY IF EXISTS "Users can create jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can view own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Users can update own jobs" ON public.jobs;

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to create jobs
CREATE POLICY "Enable insert access for authenticated users" ON public.jobs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to view their own jobs
CREATE POLICY "Enable read access for users based on user_id" ON public.jobs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = client_id);

-- Allow users to update their own jobs
CREATE POLICY "Enable update access for users based on user_id" ON public.jobs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = client_id);

-- Allow users to delete their own jobs
CREATE POLICY "Enable delete access for users based on user_id" ON public.jobs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = client_id);

-- Create job_applications table
CREATE TABLE public.job_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    job_id UUID REFERENCES public.jobs(id),
    worker_id UUID REFERENCES auth.users(id),
    proposal_text TEXT NOT NULL,
    price_bid DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for job applications
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Add policies for job applications table
CREATE POLICY "Enable insert access for authenticated users" ON public.job_applications
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Enable read access for job owner or applicant" ON public.job_applications
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT client_id FROM public.jobs WHERE id = job_id
            UNION
            SELECT worker_id
        )
    );

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_jobs_updated_at
    BEFORE UPDATE ON public.jobs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_job_applications_updated_at
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 