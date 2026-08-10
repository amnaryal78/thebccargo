import React, { useState, useEffect } from 'react';

// Team Member Interface
export interface TeamMember {
  id: number;
  slug: string;
  name: string;
  initials: string;
  role: string;
  bio: string;
  email: string;
  phone: string;
  qualifications: string;
  responsibilities: string;
}

// Team Data
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 1,
    slug: "ramesh-aryal",
    name: "Ramesh Aryal",
    initials: "RA",
    role: "Operations & Supply Chain Director",
    bio: "Managing air & ocean cargo dispatches, warehouse fulfillment, and real-time shipment monitoring.",
    email: "info@thebccargo.com",
    phone: "+977-9855019485",
    qualifications: "B.Sc. Logistics & Operations, Certified Customs Broker.",
    responsibilities: "Daily air and sea cargo operations, fleet management, warehouse operations, and shipment route optimization."
  },
  {
    id: 2,
    slug: "ayush-aryal",
    name: "Ayush Aryal",
    initials: "AA",
    role: "IT",
    bio: "Leading website architecture, digital systems, online billing, and core IT infrastructure.",
    email: "info@thebccargo.com",
    phone: "+977-9855019485",
    qualifications: "Full-Stack Web Development, Systems Architecture, Digital Infrastructure & IT Operations.",
    responsibilities: "Website architecture & UI design, automated billing system development, corporate logo & marketing banner creation, and live shipment tracking integration."
  }
];

export const TeamGrid: React.FC = () => {
  // Strict state hook for active member profile
  const [activeMember, setActiveMember] = useState<TeamMember | null>(null);

  // Escape key handler for closing modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMember(null);
      }
    };

    if (activeMember !== null) {
      document.body.classList.add('no-scroll');
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.classList.remove('no-scroll');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('no-scroll');
    };
  }, [activeMember]);

  return (
    <section className="team-section py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="section-header text-center mb-12">
          <span className="text-xs uppercase tracking-widest font-semibold px-3 py-1 bg-blue-900/40 text-amber-400 rounded-full border border-amber-400/30">
            Leadership &amp; Team
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-3">
            Meet Our <span className="text-amber-400">Leadership &amp; Team</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm mt-2">
            Dedicated logistics experts, customs specialists, and operations managers powering global trade for Nepal.
          </p>
        </div>

        {/* Team Grid */}
        <div className="team-grid grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              tabIndex={0}
              role="button"
              aria-haspopup="dialog"
              aria-label={`View full bio for ${member.name}`}
              onClick={() => setActiveMember(member)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActiveMember(member);
                }
              }}
              className="team-card bg-[#0B192C] border border-white/10 hover:border-amber-400/40 rounded-2xl p-7 text-center flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(245,166,35,0.3)]"
            >
              <div className="team-avatar w-20 h-20 rounded-full bg-[#112240] text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-5 border-2 border-white/20 shadow-none">
                {member.initials}
              </div>
              <span className="hero-brand-badge text-xs font-semibold text-amber-400 mb-2 inline-block">
                {member.role}
              </span>
              <h3 className="team-name text-xl font-bold text-white mb-1">
                {member.name}
              </h3>
              <p className="team-bio text-sm text-slate-400 leading-relaxed mb-6 flex-grow">
                {member.bio}
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMember(member);
                }}
                className="team-expand-btn w-full mt-auto py-2.5 px-4 text-xs font-bold rounded-full border border-amber-400/40 text-amber-400 bg-amber-400/10 hover:bg-amber-400 hover:text-[#0B192C] hover:border-amber-400 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <i className="fas fa-expand-alt" aria-hidden="true" /> Click to Expand
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Root-level Portal / Popup Modal Component */}
      {activeMember !== null && (
        <div
          className="modal-overlay fixed inset-0 z-[100] bg-[#0B192C]/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={() => setActiveMember(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="modal-card bg-[#0B192C] border border-white/20 rounded-2xl p-6 md:p-8 max-w-lg w-full relative shadow-2xl transform transition-transform duration-300 scale-100 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Mechanism */}
            <button
              type="button"
              onClick={() => setActiveMember(null)}
              aria-label="Close modal"
              className="absolute top-4 right-4 text-slate-400 hover:text-amber-400 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center transition-colors"
            >
              <i className="fas fa-times" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#112240] text-white font-extrabold text-2xl flex items-center justify-center border-2 border-white/20 shrink-0">
                {activeMember.initials}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{activeMember.name}</h3>
                <span className="text-xs font-semibold text-amber-400 mt-1 inline-block">
                  {activeMember.role}
                </span>
              </div>
            </div>

            {/* Overview & Bio */}
            <div className="mb-4">
              <h4 className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1">
                Overview &amp; Bio
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {activeMember.bio}
              </p>
            </div>

            {/* Qualifications */}
            <div className="mb-4">
              <h4 className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1">
                Qualifications
              </h4>
              <p className="text-sm text-slate-300">
                {activeMember.qualifications}
              </p>
            </div>

            {/* Key Responsibilities */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wider text-cyan-400 font-semibold mb-1">
                Key Responsibilities
              </h4>
              <p className="text-sm text-slate-300">
                {activeMember.responsibilities}
              </p>
            </div>

            {/* Contact Actions */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap gap-3">
              <a
                href={`mailto:${activeMember.email}`}
                className="px-4 py-2 text-xs font-bold rounded-lg border border-amber-400/40 text-amber-400 hover:bg-amber-400 hover:text-[#0B192C] transition-colors flex items-center gap-2"
              >
                <i className="fas fa-envelope" /> {activeMember.email}
              </a>
              <a
                href={`tel:${activeMember.phone.replace(/[\s\-]/g, '')}`}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-amber-400 text-[#0B192C] hover:bg-amber-300 transition-colors flex items-center gap-2"
              >
                <i className="fas fa-phone-alt" /> {activeMember.phone}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamGrid;
