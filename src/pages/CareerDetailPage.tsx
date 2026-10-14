import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobBySlug, submitApplication, JobPosting } from '../services/careersService';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  CheckCircle2, 
  Send, 
  ShieldCheck, 
  Upload,
  AlertCircle
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { TurnstileWidget } from '../components/ui/TurnstileWidget';
import { SEOHead } from '../components/SEOHead';

export const CareerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [job, setJob] = useState<JobPosting | undefined>(undefined);
  const [loadingJob, setLoadingJob] = useState(true);

  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFileObj, setResumeFileObj] = useState<{ base64: string; fileName: string; mimeType: string } | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    if (slug) {
      getJobBySlug(slug).then((found) => {
        if (mounted) {
          setJob(found);
          setLoadingJob(false);
        }
      });
    } else {
      setLoadingJob(false);
    }
    return () => { mounted = false; };
  }, [slug]);

  if (loadingJob) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-xs font-mono text-slate-400">Loading position details...</p>
      </div>
    );
  }

  if (!job || !job.published) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white">Position Not Found</h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          This career posting may have closed or been filled.
        </p>
        <Link
          to="/careers"
          className="px-4 py-2 bg-[#0B5ED7] text-white rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          View Open Positions
        </Link>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('Resume file must be under 10 MB in size.');
        return;
      }
      setResumeFileName(file.name);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        const base64Str = reader.result as string;
        setResumeFileObj({
          base64: base64Str,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !applicantName || !email) {
      setError('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await submitApplication({
        jobId: job.id,
        jobTitle: job.title,
        applicantName,
        email,
        phone,
        experienceYears: Number(experienceYears) || 0,
        coverLetter: coverLetter.trim()
      }, turnstileToken, resumeFileObj || undefined);

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.record) {
        setSubmittedRef(result.record.id);
      }
    } catch (err) {
      console.error('Failed to submit application:', err);
      setError('Failed to submit application. Please email your CV directly to info@thebccargo.com.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full flex flex-col gap-10">
      <SEOHead
        title={`${job.title} | Careers at BC Cargo & Courier`}
        description={job.description}
      />

      {/* Back link */}
      <Link
        to="/careers"
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B5ED7] hover:underline self-start"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Open Positions</span>
      </Link>

      {/* Job Title & Summary Banner */}
      <div className="bg-white dark:bg-[#071A33] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
            {job.department}
          </span>
          <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold uppercase tracking-wider">
            {job.type}
          </span>
        </div>

        <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
          {job.title}
        </h1>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0B5ED7]" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0B5ED7]" />
            <span>Full-time Position</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Job Description & Details (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="p-6 sm:p-8 flex flex-col gap-6">
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2">
                About the Role
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {job.description}
              </p>
            </div>

            {job.requirements && job.requirements.length > 0 && (
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Requirements &amp; Qualifications
                </h4>
                <ul className="space-y-2">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.responsibilities && job.responsibilities.length > 0 && (
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Key Responsibilities
                </h4>
                <ul className="space-y-2">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <Briefcase className="w-4 h-4 text-[#0B5ED7] shrink-0 mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-slate-50 dark:bg-[#060919] border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0B5ED7] shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <strong className="text-slate-900 dark:text-white block font-heading">
                Working at The BC Cargo
              </strong>
              <span>
                We provide hands-on training, fair pay, and a supportive team atmosphere. All applications are reviewed with care.
              </span>
            </div>
          </Card>
        </div>

        {/* Right Column: Direct Application Form (5 cols) */}
        <div className="lg:col-span-5">
          <Card className="p-6 sm:p-8 flex flex-col gap-5 shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="flex flex-col gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                Apply for this Position
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Send your application directly to our team
              </span>
            </div>

            {submittedRef ? (
              <div className="py-8 text-center flex flex-col items-center gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-900/50">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                  Application Received!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xs">
                  Your application reference code is:
                </p>
                <span className="font-mono font-bold text-sm text-[#0B5ED7]">{submittedRef}</span>
                <p className="text-[11px] text-slate-400">
                  Our team will review your application and reach out to you within 3 business days.
                </p>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Input
                  label="Full Name *"
                  placeholder="e.g. Ramesh Shrestha"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="ramesh@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Input
                  label="Phone Number"
                  placeholder="+977-9801234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  min="0"
                  max="35"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                />

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Upload Resume or CV (PDF, DOCX up to 10MB)
                  </label>
                  <label className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:border-[#0B5ED7] transition-colors flex flex-col items-center gap-2">
                    <Upload className="w-5 h-5 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {resumeFileName ? (
                        <strong className="text-[#0B5ED7]">{resumeFileName}</strong>
                      ) : (
                        'Click to choose your resume file'
                      )}
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <Textarea
                  label="Message or Summary about Yourself"
                  rows={3}
                  placeholder="Tell us a little bit about yourself and why you'd like to work with us..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                />

                {/* Cloudflare Turnstile Anti-bot Protection Widget */}
                <TurnstileWidget onVerify={(tok) => setTurnstileToken(tok)} className="my-1" />

                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="w-full mt-2"
                >
                  <Send className="w-4 h-4 mr-2" />
                  <span>{submitting ? 'Submitting Application...' : 'Submit Job Application'}</span>
                </Button>
              </form>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};
