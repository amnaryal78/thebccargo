import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobBySlug, submitApplication, JobPosting } from '../services/careersService';
import { SEOHead } from '../components/SEOHead';
import { Stepper } from '../design/primitives/Stepper';
import { Button } from '../design/primitives/Button';
import { Input } from '../design/primitives/Input';
import { Spotlight } from '../components/ui/spotlight';
import { TurnstileWidget } from '../components/TurnstileWidget';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  FileText,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { RegistrationCorners, BarcodeStrip } from '../design/icons';

const APPLICATION_STEPS = [
  { id: 'step-details', label: '1. Your details' },
  { id: 'step-cv', label: '2. CV and message' },
  { id: 'step-review', label: '3. Check and send' },
];

import { RouteSkeleton } from '../components/RouteSkeleton';

export const CareerDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [job, setJob] = useState<JobPosting | undefined>(undefined);
  const [loadingJob, setLoadingJob] = useState(true);

  // Stepper State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Form State
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [locationCity, setLocationCity] = useState('');
  const [experienceYears, setExperienceYears] = useState('3');
  const [coverLetter, setCoverLetter] = useState('');
  
  // File Upload State
  const [resumeFileObj, setResumeFileObj] = useState<{ base64: string; fileName: string; mimeType: string } | null>(null);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);

  // Verification & Submission
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      
      if (!validTypes.includes(file.type) && !file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
        setError('Only PDF or DOCX format resumes are accepted.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Resume file size must not exceed 5 MB.');
        return;
      }

      setResumeFileName(file.name);
      setFileSizeStr(`${(file.size / (1024 * 1024)).toFixed(2)} MB`);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        setResumeFileObj({
          base64: reader.result as string,
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    if (!applicantName.trim()) {
      setError('Please provide your full legal name.');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid official email address.');
      return false;
    }
    if (!phone.trim() || phone.length < 8) {
      setError('Please enter a valid telephone contact number.');
      return false;
    }
    setError(null);
    return true;
  };

  const validateStep2 = () => {
    if (!resumeFileName && !resumeFileObj) {
      setError('Please attach your Resume / Curriculum Vitae (PDF/DOCX).');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = () => {
    if (currentStepIndex === 0 && !validateStep1()) return;
    if (currentStepIndex === 1 && !validateStep2()) return;
    setCurrentStepIndex((prev) => Math.min(prev + 1, APPLICATION_STEPS.length - 1));
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    setError(null);

    const { record, error: submitErr } = await submitApplication(
      {
        jobId: job.id,
        jobTitle: job.title,
        applicantName,
        email,
        phone,
        experienceYears: parseInt(experienceYears, 10) || 0,
        coverLetter: `[Station City: ${locationCity || 'Unspecified'}] ${coverLetter}`,
        resumeUrl: resumeFileObj ? resumeFileObj.base64 : undefined,
      },
      turnstileToken
    );

    setSubmitting(false);

    if (submitErr) {
      setError(submitErr);
    } else {
      setSubmittedRef(record?.id || `APP-${Math.floor(1000 + Math.random() * 9000)}`);
    }
  };

  if (loadingJob) {
    return <RouteSkeleton />;
  }

  if (!job || !job.published) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="font-heading font-bold text-2xl text-[var(--text)]">Position Concluded</h2>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md">
          This operational posting has been filled or closed by the HR logistics panel.
        </p>
        <Link to="/careers">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            View Active Vacancies
          </Button>
        </Link>
      </div>
    );
  }

  // Schema.org JobPosting structured data
  const jobSchema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.createdAt,
    employmentType: job.type.toUpperCase().replace('-', '_'),
    hiringOrganization: {
      '@type': 'Organization',
      name: 'The BC Cargo & Courier',
      sameAs: 'https://thebccargo.com',
      logo: 'https://thebccargo.com/bc-logo.svg',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'NP',
      },
    },
  };

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <SEOHead
        title={`${job.title} | Careers | The BC Cargo & Courier`}
        description={`Apply for ${job.title} at The BC Cargo & Courier. Station: ${job.location}. Multimodal cargo and courier operations.`}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobSchema) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Back Link */}
        <Link
          to="/careers"
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Openings</span>
        </Link>

        {/* VACANCY BANNER */}
        <Spotlight
          intensity="normal"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-8 shadow-hard-md"
        >
          <RegistrationCorners className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-[var(--r-xs)] bg-[var(--surface-muted)] border border-[var(--line)] text-[var(--oxford-deep)] shadow-hard-xs">
                {job.department}
              </span>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {job.location}
              </span>
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.type}
              </span>
            </div>

            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl text-[var(--text)] tracking-tight">
              {job.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              {job.description}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--line)] text-xs">
              <div className="space-y-2">
                <span className="font-bold uppercase text-[var(--text)]">Core Requirements:</span>
                <ul className="space-y-1.5 text-[var(--text-secondary)]">
                  {job.requirements.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-mid,#16A34A)] shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <span className="font-bold uppercase text-[var(--text)]">Primary Responsibilities:</span>
                <ul className="space-y-1.5 text-[var(--text-secondary)]">
                  {job.responsibilities.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] shrink-0 mt-1.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </RegistrationCorners>
        </Spotlight>

        {/* APPLICATION STEPPER CONTAINER */}
        <Spotlight
          intensity="strong"
          className="bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] p-6 sm:p-8 shadow-hard-md space-y-8"
        >
          
          <div className="pb-4 border-b border-[var(--line)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--gold-dark)]">
              Formal Candidate Intake Portal
            </span>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[var(--text)] mt-1">
              Apply for {job.title}
            </h2>
          </div>

          {submittedRef ? (
            /* SUCCESS STATE */
            <div className="p-8 text-center space-y-4 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-sm)] shadow-hard-sm">
              <div className="w-14 h-14 rounded-full bg-[var(--green-mid,#16A34A)]/10 text-[var(--green-mid,#16A34A)] flex items-center justify-center mx-auto shadow-hard-xs">
                <FileCheck className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-2xl text-[var(--text)]">
                Application Manifest Received
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                Thank you, {applicantName}. Your candidate dossier has been catalogued in our HR dispatch registry under tracking code:
              </p>
              <div className="inline-block p-2 px-4 rounded-[var(--r-xs)] bg-[var(--surface)] border border-[var(--line)] shadow-hard-xs font-bold text-sm text-[var(--oxford-deep)]">
                {submittedRef}
              </div>
              <div className="pt-2">
                <BarcodeStrip code={submittedRef} height={28} />
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Our operations team will review your CV within 3 working days.
              </p>
              <div className="pt-3">
                <Link to="/careers">
                  <Button variant="outline" size="sm">
                    Return to Open Positions
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitApplication} className="space-y-6">
              
              {/* Stepper Progress Bar */}
              <Stepper
                steps={APPLICATION_STEPS}
                currentStepIndex={currentStepIndex}
                onStepClick={(idx) => {
                  if (idx < currentStepIndex) setCurrentStepIndex(idx);
                }}
              />

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-700 rounded-[var(--r-xs)] text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1: DETAILS */}
              {currentStepIndex === 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-heading font-bold text-base text-[var(--text)]">
                    Your details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Full Legal Name"
                      required
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      placeholder="e.g. Ramesh Karki"
                    />

                    <Input
                      label="Primary Email Address"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramesh@gmail.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Telephone / Mobile Number"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+977 98XXXXXXXX"
                    />

                    <Input
                      label="Current City / Station"
                      value={locationCity}
                      onChange={(e) => setLocationCity(e.target.value)}
                      placeholder="e.g. Kathmandu or Hetauda"
                    />

                    <div>
                      <label className="block text-xs font-bold uppercase text-[var(--text)] mb-1.5">
                        Logistics Experience
                      </label>
                      <select
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        aria-label="Logistics Experience"
                        className="w-full h-11 px-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-sm)] font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[var(--oxford-deep)] focus:border-transparent clay-inset"
                      >
                        <option value="0">Entry Level (&lt; 1 Year)</option>
                        <option value="1">1 – 2 Years</option>
                        <option value="3">3 – 5 Years</option>
                        <option value="6">6+ Years Senior</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="button" variant="primary" onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Continue to Resume Upload
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: CV UPLOAD & COVER NOTE */}
              {currentStepIndex === 1 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-heading font-bold text-base text-[var(--text)]">
                    Your CV and message
                  </h3>

                  {/* Drag and drop upload zone */}
                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text)] mb-1.5">
                      Curriculum Vitae (PDF or DOCX, max 5 MB) <span className="text-[var(--danger)]">*</span>
                    </label>
                    <div className="border border-dashed border-[var(--line)] rounded-[var(--r-sm)] p-6 bg-[var(--surface-muted)] text-center relative hover:bg-[var(--surface)] clay-inset transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Upload Curriculum Vitae"
                      />
                      <Upload className="w-8 h-8 text-[var(--gold-dark)] mx-auto mb-2" />
                      {resumeFileName ? (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[var(--oxford-deep)] block">
                            Attached: {resumeFileName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            Size: {fileSizeStr} · Click to replace file
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-[var(--text)] block">
                            Click or drag file here to attach CV
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            Supported: Adobe PDF (.pdf) or Microsoft Word (.docx)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-[var(--text)] mb-1.5">
                      Candidate Statement / Logistics Background
                    </label>
                    <textarea
                      rows={4}
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder="Briefly outline your logistics background, familiarity with customs or freight systems, and why you wish to join The BC Cargo..."
                      className="w-full p-3 bg-[var(--surface)] text-[var(--text)] border border-[var(--line)] rounded-[var(--r-sm)] font-sans text-xs focus:outline-none focus:ring-2 focus:ring-[var(--oxford-deep)] focus:border-transparent clay-inset"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Back
                    </Button>

                    <Button type="button" variant="primary" onClick={handleNextStep} rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Review Application
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: REVIEW & TURNSTILE VERIFICATION */}
              {currentStepIndex === 2 && (
                <div className="space-y-4 pt-2">
                  <h3 className="font-heading font-bold text-base text-[var(--text)]">
                    Check and send
                  </h3>

                  {/* Summary Box */}
                  <div className="p-4 bg-[var(--surface-muted)] border border-[var(--line)] rounded-[var(--r-sm)] space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Position Applied:</span>
                      <span className="font-bold text-[var(--text)]">{job.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Applicant Name:</span>
                      <span className="font-bold text-[var(--text)]">{applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Email &amp; Mobile:</span>
                      <span className="font-bold text-[var(--text)]">{email} · {phone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Attached Resume:</span>
                      <span className="font-bold text-[var(--green-mid,#16A34A)]">{resumeFileName || 'Attached'}</span>
                    </div>
                  </div>

                  {/* Cloudflare Turnstile Verification */}
                  <div className="p-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-sm)] space-y-2">
                    <span className="block text-xs font-bold uppercase text-[var(--text-muted)]">
                      Bot &amp; Integrity Verification
                    </span>
                    <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Button type="button" variant="outline" onClick={handlePrevStep} leftIcon={<ArrowLeft className="w-4 h-4" />}>
                      Edit Details
                    </Button>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting}
                      className="min-h-[48px] px-6 py-3.5 font-bold text-xs sm:text-sm shadow-md"
                    >
                      {submitting ? 'Transmitting Dossier...' : 'Submit Final Application'}
                    </Button>
                  </div>
                </div>
              )}

            </form>
          )}

        </Spotlight>

      </div>
    </div>
  );
};
