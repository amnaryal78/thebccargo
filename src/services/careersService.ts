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

const INITIAL_JOBS: JobPosting[] = [
  {
    id: 'JOB-01',
    title: 'Air Freight Operations Specialist',
    slug: 'air-freight-operations-specialist',
    department: 'Aviation & Airport Logistics',
    location: 'Kathmandu (TIA Hub)',
    type: 'Full-time',
    description: 'Lead air cargo charter space bookings, airline airway bill (AWB) documentation, and tarmac bonded warehouse transfers.',
    requirements: [
      'Minimum 3 years experience in international air freight cargo',
      'Familiarity with IATA Dangerous Goods regulations and CAAN guidelines',
      'Strong command of English and Nepali trade correspondence'
    ],
    responsibilities: [
      'Coordinate daily flight cargo manifests with international airlines',
      'Inspect physical cargo packaging and weight declarations',
      'Issue master and house air waybills (MAWB/HAWB)'
    ],
    published: true,
    createdAt: '2026-09-01T08:00:00Z'
  },
  {
    id: 'JOB-02',
    title: 'Customs Clearance Officer',
    slug: 'customs-clearance-officer-birgunj',
    department: 'Customs & Compliance',
    location: 'Birgunj ICD / Border Hub',
    type: 'Full-time',
    description: 'Manage customs valuation, Pragyapan Patra declarations, and ASYCUDA World submissions at Birgunj Inland Container Depot.',
    requirements: [
      'Licensed Customs Agent or 4+ years dry port customs experience',
      'Expertise in Harmonized System (HS) code classification',
      'Proven experience working with Nepal Department of Customs'
    ],
    responsibilities: [
      'Prepare customs entry documentation for ocean and overland freight',
      'Represent clients during physical cargo examination',
      'Ensure zero-hold customs releases for express imports'
    ],
    published: true,
    createdAt: '2026-09-05T09:00:00Z'
  }
];

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
  return INITIAL_JOBS;
};

export const getJobs = (): JobPosting[] => {
  return INITIAL_JOBS;
};

export const getJobBySlug = async (slug: string): Promise<JobPosting | undefined> => {
  const jobs = await fetchJobs();
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

  // Graceful offline local fallback
  const fallbackRecord: JobApplication = {
    ...app,
    id: `APP-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'new',
    createdAt: new Date().toISOString()
  };

  return { record: fallbackRecord, error: null };
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
