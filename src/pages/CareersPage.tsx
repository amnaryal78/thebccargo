import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Clock, MapPin, ArrowRight, Mail } from 'lucide-react';
import { fetchPublicJobs, JobPosting } from '../services/careersService';
import { Skeleton, SkeletonGroup } from '../design/primitives/Skeleton';
import { SEOHead } from '../components/SEOHead';
import { Button } from '../design/primitives/Button';
import { Spotlight } from '../components/ui/spotlight';
import { PAGE_META } from '../data/pageMeta';

export const CareersPage: React.FC = () => {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetchPublicJobs()
      .then((list) => {
        if (alive) setJobs(list.filter((j) => j.published));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="w-full bg-[var(--bg,#F6F6F4)] text-[var(--text,#121211)] py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <SEOHead
        title={PAGE_META['/careers'].title}
        description={PAGE_META['/careers'].description}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="space-y-3 max-w-2xl">
          <h1 className="font-heading font-bold text-[length:var(--fs-h2)] leading-[1.1] tracking-[-0.02em] text-[var(--brand)] text-balance">Careers</h1>
          <p className="text-[17px] leading-relaxed text-[var(--text-muted)] max-w-xl">Work with us at BC Cargo. See our open jobs below.</p>
        </header>

        {loading && (
          <SkeletonGroup label="Loading jobs" className="space-y-4">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-32 rounded-[var(--r-md)]" />)}
          </SkeletonGroup>
        )}

        {!loading && jobs.length === 0 && (
          <div className="p-8 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] flex flex-col items-start gap-3">
            <Briefcase className="w-8 h-8 text-[var(--text-muted)]" aria-hidden="true" />
            <h2 className="font-heading font-bold text-xl">No open jobs right now</h2>
            <p className="text-sm text-[var(--text-secondary)]">
              You can still send us your CV. We will contact you when a job opens.
            </p>
            <a href="mailto:thebccargo@gmail.com">
              <Button variant="outline" leftIcon={<Mail className="w-4 h-4" />}>
                Email your CV
              </Button>
            </a>
          </div>
        )}

        <ul className="space-y-4">
          {jobs.map((job) => (
            <li key={job.id}>
              <Spotlight
                intensity="subtle"
                className="p-6 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--r-md)] shadow-hard-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div className="space-y-2 min-w-0">
                    <h2 className="font-heading font-bold text-xl">{job.title}</h2>
                    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-muted)]">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {job.location}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {job.type}
                      </span>
                    </p>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{job.description}</p>
                  </div>
                  <Link to={`/careers/${job.slug}`} className="shrink-0">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Apply
                    </Button>
                  </Link>
                </div>
              </Spotlight>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
