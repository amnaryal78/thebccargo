import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getJobs, JobPosting, submitApplication } from '../services/careersService';
import { Briefcase, MapPin, Clock, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SEOHead } from '../components/SEOHead';

export const CareersPage: React.FC = () => {
  const jobs = getJobs().filter((j) => j.published);

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-12">
      <SEOHead
        title="Careers & Job Openings | The BC Cargo & Courier"
        description="Explore open jobs at The BC Cargo & Courier across Nepal. Join our friendly team in customer service, package handling, dispatch, and delivery."
      />

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-[#0B5ED7] text-xs font-mono font-bold uppercase tracking-wider">
          <Briefcase className="w-3.5 h-3.5" />
          <span>Join Our Team</span>
        </div>
        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white uppercase tracking-tight">
          Work With The BC Cargo
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
          Join our friendly team helping people and businesses send packages quickly and safely across Nepal and worldwide.
        </p>
      </div>

      {/* Culture & Values Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="group p-6 flex flex-col gap-3 hover:border-[#0B5ED7]/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-all duration-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-colors">
            Honest &amp; Licensed Team
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We are a licensed customs brokerage (License #B-409) with a supportive team, clear rules, and hands-on training.
          </p>
        </Card>

        <Card className="group p-6 flex flex-col gap-3 hover:border-[#0B5ED7]/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-all duration-300 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-colors">
            Simple &amp; Modern Tools
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Work with easy digital systems, live package tracking, and clear software designed to make your daily job smooth.
          </p>
        </Card>

        <Card className="group p-6 flex flex-col gap-3 hover:border-[#0B5ED7]/60 transition-all">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/60 group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-all duration-300 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white group-hover:text-[#0B5ED7] dark:group-hover:text-[#2F80ED] transition-colors">
            Room to Grow
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Learn new skills and advance your career across our delivery hubs in Hetauda, Kathmandu, Birgunj, and beyond.
          </p>
        </Card>
      </div>

      {/* Open Positions List */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <h2 className="font-heading font-extrabold text-2xl text-slate-900 dark:text-white uppercase tracking-tight">
            Current Open Roles ({jobs.length})
          </h2>
          <span className="text-xs font-mono text-slate-400">
            Verified Opportunities
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <Card key={job.id} className="group flex flex-col justify-between gap-6 hover:border-[#F5C84C] transition-all shadow-md">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded bg-[#0E1638] text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                    {job.department}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#F5C84C] transition-colors" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#F5C84C] transition-colors" />
                      {job.location}
                    </span>
                  </div>
                </div>

                <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mt-1 group-hover:text-[#F5C84C] transition-colors">
                  {job.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {job.description}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 mt-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-2">
                    Core Qualifications:
                  </span>
                  <ul className="space-y-1.5">
                    {job.requirements.slice(0, 3).map((req, idx) => (
                      <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Link to={`/careers/${job.slug}`} className="w-full">
                  <Button variant="primary" className="w-full">
                    <span>View Role &amp; Apply</span>
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* General Application Callout */}
      <Card className="p-8 text-center flex flex-col items-center gap-3 bg-slate-100 dark:bg-[#060919] border border-slate-200 dark:border-slate-800">
        <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
          Don't see a role that fits you?
        </h4>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md">
          We are always happy to meet hard-working people in customer service, driving, package handling, and operations. Send your CV directly to our team.
        </p>
        <a
          href="mailto:thebcargo@gmail.com"
          className="text-xs font-bold text-[#0B5ED7] hover:underline uppercase tracking-wider font-mono mt-1"
        >
          Email: thebcargo@gmail.com
        </a>
      </Card>

    </div>
  );
};
