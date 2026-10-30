import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface JobPosting {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Part-time';
  description: string;
  requirements: string[];
  responsibilities: string[];
  published: boolean;
  createdAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  experienceYears: number;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'new' | 'reviewed' | 'shortlisted' | 'rejected';
  createdAt: string;
}

export const fetchJobs = async (): Promise<JobPosting[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          department: row.department,
          location: row.location,
          type: row.type as any,
          description: row.description,
          requirements: row.requirements || [],
          responsibilities: row.responsibilities || [],
          published: row.published,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch jobs from Supabase:', err);
    }
  }
  // No placeholder postings: an empty list shows the "No open jobs" state.
  return [];
};

let publicJobs: { at: number; list: Promise<JobPosting[]> } | null = null;

/** Public careers pages share one list for a minute, so opening a job does not refetch. Admin uses fetchJobs. */
export const fetchPublicJobs = (): Promise<JobPosting[]> => {
  if (!publicJobs || Date.now() - publicJobs.at > 60_000) publicJobs = { at: Date.now(), list: fetchJobs() };
  return publicJobs.list;
};

export const getJobBySlug = async (slug: string): Promise<JobPosting | undefined> => {
  const jobs = await fetchPublicJobs();
  return jobs.find((j) => j.slug.toLowerCase() === slug.toLowerCase());
};

export const fetchJobApplications = async (): Promise<JobApplication[]> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map((row: any) => ({
          id: row.id,
          jobId: row.career_id || row.job_id || '',
          jobTitle: row.job_title || 'General Application',
          applicantName: row.applicant_name,
          email: row.email,
          phone: row.phone,
          experienceYears: row.experience_years || 0,
          coverLetter: row.cover_letter,
          resumeUrl: row.resume_url,
          status: row.status as any,
          createdAt: row.created_at
        }));
      }
    } catch (err) {
      console.warn('Failed to fetch job applications from Supabase:', err);
    }
  }
  return [];
};

export const submitApplication = async (
  app: Omit<JobApplication, 'id' | 'createdAt' | 'status'>,
  turnstileToken?: string,
  resumeFile?: { base64: string; fileName: string; mimeType: string }
): Promise<{ record: JobApplication | null; error: string | null }> => {
  if (isSupabaseConfigured) {
    const id = crypto.randomUUID();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(app.jobId);
    const { error } = await supabase.from('job_applications').insert({
      id,
      job_id: isUuid ? app.jobId : null,
      job_title: app.jobTitle,
      applicant_name: app.applicantName,
      email: app.email,
      phone: app.phone,
      experience_years: app.experienceYears,
      cover_letter: app.coverLetter ?? null,
    });
    if (error) {
      console.warn('Job application insert failed:', error.message);
      return { record: null, error: 'We could not send your application. Please try again.' };
    }
    return { record: { ...app, id, status: 'new', createdAt: new Date().toISOString() }, error: null };
  }

  // Never report success when nothing was saved.
  return { record: null, error: "Applications are unavailable right now. Please email us instead." };
};

export const saveJob = async (job: Partial<JobPosting> & { title: string; slug: string; department: string; location: string; type: string; description: string }): Promise<JobPosting | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('careers')
        .upsert({
          id: job.id,
          title: job.title,
          slug: job.slug,
          department: job.department,
          location: job.location,
          type: job.type,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          published: job.published ?? true
        })
        .select()
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          slug: data.slug,
          department: data.department,
          location: data.location,
          type: data.type,
          description: data.description,
          requirements: data.requirements || [],
          responsibilities: data.responsibilities || [],
          published: data.published,
          createdAt: data.created_at
        };
      }
    } catch (err) {
      console.warn('Failed to save job in Supabase:', err);
    }
  }
  return null;
};

export const deleteJob = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('careers').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Failed to delete job in Supabase:', err);
    }
  }
  return false;
};

export const updateApplicationStatus = async (id: string, status: JobApplication['status']): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('job_applications').update({ status }).eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Failed to update application status:', err);
    }
  }
  return false;
};

export const deleteApplication = async (id: string): Promise<boolean> => {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('job_applications').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Failed to delete application:', err);
    }
  }
  return false;
};
