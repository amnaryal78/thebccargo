import React from 'react';

export const LogisticsMotionGraphicSection: React.FC = () => {
  return (
    <section 
      id="how-it-moves"
      aria-label="How Your Shipment Moves"
      className="w-full py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center gap-8 sm:gap-12 transition-colors"
    >
      {/* Section Introduction Header */}
      <div className="flex flex-col items-center text-center gap-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/60 text-[#0B5ED7] dark:text-[#2F80ED] text-xs font-mono font-bold uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span>How Your Package Moves</span>
        </div>

        <h2 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-slate-900 dark:text-white tracking-tight leading-tight">
          From Pickup to Delivery
        </h2>

        <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
          Watch how your package travels from our counter in Nepal safely all the way to the receiver's doorstep.
        </p>
      </div>

      {/* Large OpenAI / Codex-Style Contained Visual Frame */}
      <div className="w-full max-w-[1200px] mx-auto rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800/90 shadow-2xl dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] overflow-hidden bg-[#081325] relative aspect-[3/5] sm:aspect-[4/5] md:aspect-[16/9] min-h-[480px] sm:min-h-[520px] md:min-h-[460px] flex items-center justify-center">
        
        {/* Scoped CSS Keyframes & Typography */}
        <style>{`
          .bc-logistics-motion {
            width: 100%;
            height: 100%;
            display: block;
            user-select: none;
          }

          /* TYPOGRAPHY & LABELS */
          .bc-station-title {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 0.6px;
            fill: #ffffff;
            text-anchor: middle;
            font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, sans-serif;
          }

          .bc-station-sub {
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.3px;
            fill: #94a3b8;
            text-anchor: middle;
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
          }

          .bc-station-tag {
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.8px;
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
          }

          .bc-timeline-text {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.8px;
            fill: #64748b;
            text-anchor: middle;
            font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
          }

          /* HARDWARE ACCELERATED ANIMATION CARRIER CLASS */
          .bc-anim-carrier {
            will-change: transform, opacity;
            animation-duration: 30s;
            animation-iteration-count: infinite;
            animation-timing-function: linear;
          }

          /* MOBILE KEYFRAME DEFINITIONS */
          @keyframes bcAnimCustomerMob {
            0%      { transform: translate(10px, 110px); opacity: 0; }
            1.67%   { transform: translate(25px, 110px); opacity: 1; }
            6.67%   { transform: translate(45px, 110px); opacity: 1; }
            8.33%   { transform: translate(45px, 110px); opacity: 1; }
            10.00%  { transform: translate(45px, 110px); opacity: 1; }
            13.33%  { transform: translate(25px, 110px); opacity: 0.8; }
            16.67%  { transform: translate(10px, 110px); opacity: 0; }
            100%    { transform: translate(10px, 110px); opacity: 0; }
          }

          @keyframes bcAnimStaffMob {
            0%      { transform: translate(65px, 110px); opacity: 0; }
            8.33%   { transform: translate(65px, 110px); opacity: 1; }
            10.00%  { transform: translate(65px, 110px); opacity: 1; }
            16.67%  { transform: translate(105px, 110px); opacity: 1; }
            18.33%  { transform: translate(105px, 110px); opacity: 1; }
            20.00%  { transform: translate(105px, 110px); opacity: 1; }
            22.00%  { transform: translate(75px, 110px); opacity: 1; }
            24.00%  { transform: translate(75px, 110px); opacity: 0; }
            100%    { transform: translate(75px, 110px); opacity: 0; }
          }

          @keyframes bcAnimTruckMob {
            0%      { transform: translate(105px, 100px); opacity: 1; }
            21.67%  { transform: translate(105px, 100px); opacity: 1; }
            36.67%  { transform: translate(200px, 190px); opacity: 1; }
            38.33%  { transform: translate(200px, 190px); opacity: 1; }
            40.00%  { transform: translate(200px, 190px); opacity: 1; }
            41.50%  { transform: translate(215px, 190px); opacity: 0; }
            96.00%  { transform: translate(105px, 100px); opacity: 0; }
            97.00%  { transform: translate(105px, 100px); opacity: 1; }
            100%    { transform: translate(105px, 100px); opacity: 1; }
          }

          @keyframes bcAnimAirplaneMob {
            0%      { transform: translate(220px, 200px) rotate(135deg); opacity: 0; }
            39.99%  { transform: translate(220px, 200px) rotate(135deg); opacity: 0; }
            40.00%  { transform: translate(220px, 200px) rotate(135deg); opacity: 1; }
            51.67%  { transform: translate(140px, 260px) rotate(150deg); opacity: 1; }
            63.33%  { transform: translate(60px, 330px) rotate(165deg); opacity: 1; }
            65.00%  { transform: translate(60px, 330px); opacity: 1; }
            66.00%  { transform: translate(60px, 330px); opacity: 0; }
            100%    { transform: translate(220px, 200px); opacity: 0; }
          }

          @keyframes bcAnimMotorcycleMob {
            0%      { transform: translate(60px, 370px); opacity: 0; }
            64.00%  { transform: translate(60px, 370px); opacity: 1; }
            66.67%  { transform: translate(60px, 370px); opacity: 1; }
            76.67%  { transform: translate(220px, 470px); opacity: 1; }
            87.00%  { transform: translate(220px, 470px); opacity: 1; }
            93.33%  { transform: translate(220px, 470px); opacity: 0; }
            100%    { transform: translate(60px, 370px); opacity: 0; }
          }

          @keyframes bcAnimCourierWalkingMob {
            0%      { transform: translate(225px, 470px); opacity: 0; }
            79.99%  { transform: translate(225px, 470px); opacity: 0; }
            80.00%  { transform: translate(225px, 470px); opacity: 1; }
            83.33%  { transform: translate(250px, 470px); opacity: 1; }
            85.00%  { transform: translate(250px, 470px); opacity: 1; }
            93.33%  { transform: translate(250px, 470px); opacity: 1; }
            96.67%  { transform: translate(250px, 470px); opacity: 0; }
            100%    { transform: translate(225px, 470px); opacity: 0; }
          }

          @keyframes bcAnimReceiverMob {
            0%      { transform: translate(270px, 470px); opacity: 0; }
            75.00%  { transform: translate(270px, 470px); opacity: 1; }
            93.33%  { transform: translate(270px, 470px); opacity: 1; }
            96.67%  { transform: translate(270px, 470px); opacity: 0; }
            100%    { transform: translate(270px, 470px); opacity: 0; }
          }

          @keyframes bcAnimTrackProgressFillMob {
            0%   { stroke-dashoffset: 300; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes bcAnimTrackProgressDotMob {
            0%   { transform: translateX(0px); }
            100% { transform: translateX(300px); }
          }

          .bc-track-fill-line-mob {
            stroke-dasharray: 300;
            stroke-dashoffset: 300;
            animation: bcAnimTrackProgressFillMob 30s linear infinite;
            will-change: stroke-dashoffset;
          }

          .bc-track-dot-marker-mob {
            animation: bcAnimTrackProgressDotMob 30s linear infinite;
            will-change: transform;
          }

          /* KEYFRAME DEFINITIONS (30.0s MASTER TIMELINE) */
          @keyframes bcAnimCustomer {
            0%      { transform: translate(20px, 485px); opacity: 0; }
            1.67%   { transform: translate(45px, 485px); opacity: 1; }
            6.67%   { transform: translate(115px, 485px); opacity: 1; }
            8.33%   { transform: translate(115px, 485px); opacity: 1; }
            10.00%  { transform: translate(115px, 485px); opacity: 1; }
            13.33%  { transform: translate(50px, 485px); opacity: 0.8; }
            16.67%  { transform: translate(10px, 485px); opacity: 0; }
            100%    { transform: translate(10px, 485px); opacity: 0; }
          }

          @keyframes bcAnimParcelCustomer {
            0%      { opacity: 0; }
            1.67%   { opacity: 1; }
            8.32%   { opacity: 1; }
            8.33%   { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimParcelCounter {
            0%      { opacity: 0; }
            8.32%   { opacity: 0; }
            8.33%   { opacity: 1; }
            9.99%   { opacity: 1; }
            10.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimStaff {
            0%      { transform: translate(155px, 485px); opacity: 0; }
            8.33%   { transform: translate(155px, 485px); opacity: 1; }
            10.00%  { transform: translate(155px, 485px); opacity: 1; }
            16.67%  { transform: translate(232px, 485px); opacity: 1; }
            18.33%  { transform: translate(232px, 485px); opacity: 1; }
            20.00%  { transform: translate(232px, 485px); opacity: 1; }
            22.00%  { transform: translate(170px, 485px); opacity: 1; }
            24.00%  { transform: translate(170px, 485px); opacity: 0; }
            100%    { transform: translate(170px, 485px); opacity: 0; }
          }

          @keyframes bcAnimParcelStaff {
            0%      { opacity: 0; }
            9.99%   { opacity: 0; }
            10.00%  { opacity: 1; }
            18.32%  { opacity: 1; }
            18.33%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimTruck {
            0%      { transform: translate(235px, 475px); opacity: 1; }
            21.67%  { transform: translate(235px, 475px); opacity: 1; }
            36.67%  { transform: translate(450px, 475px); opacity: 1; }
            38.33%  { transform: translate(450px, 475px); opacity: 1; }
            40.00%  { transform: translate(450px, 475px); opacity: 1; }
            41.50%  { transform: translate(480px, 475px); opacity: 0; }
            96.00%  { transform: translate(235px, 475px); opacity: 0; }
            97.00%  { transform: translate(235px, 475px); opacity: 1; }
            100%    { transform: translate(235px, 475px); opacity: 1; }
          }

          @keyframes bcAnimParcelTruck {
            0%      { opacity: 0; }
            18.32%  { opacity: 0; }
            18.33%  { opacity: 1; }
            39.99%  { opacity: 1; }
            40.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimAirplane {
            0%      { transform: translate(495px, 440px) rotate(-35deg); opacity: 0; }
            39.99%  { transform: translate(495px, 440px) rotate(-35deg); opacity: 0; }
            40.00%  { transform: translate(495px, 440px) rotate(-35deg); opacity: 1; }
            42.92%  { transform: translate(524px, 375px) rotate(-32deg); opacity: 1; }
            45.83%  { transform: translate(560px, 318px) rotate(-26deg); opacity: 1; }
            48.75%  { transform: translate(604px, 271px) rotate(-16deg); opacity: 1; }
            51.67%  { transform: translate(653px, 237px) rotate(-5deg);  opacity: 1; }
            53.33%  { transform: translate(675px, 222px) rotate(0deg);   opacity: 1; }
            55.00%  { transform: translate(697px, 237px) rotate(5deg);   opacity: 1; }
            57.50%  { transform: translate(746px, 271px) rotate(16deg);  opacity: 1; }
            60.42%  { transform: translate(790px, 318px) rotate(26deg);  opacity: 1; }
            62.08%  { transform: translate(826px, 375px) rotate(32deg);  opacity: 1; }
            63.33%  { transform: translate(855px, 440px) rotate(0deg);   opacity: 1; }
            65.00%  { transform: translate(855px, 440px) rotate(0deg);   opacity: 1; }
            66.00%  { transform: translate(855px, 440px) rotate(0deg);   opacity: 0; }
            100%    { transform: translate(495px, 440px) rotate(-35deg); opacity: 0; }
          }

          @keyframes bcAnimParcelAirplane {
            0%      { opacity: 0; }
            40.00%  { opacity: 0; }
            40.10%  { opacity: 1; }
            64.99%  { opacity: 1; }
            65.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimMotorcycle {
            0%      { transform: translate(890px, 480px); opacity: 0; }
            64.00%  { transform: translate(890px, 480px); opacity: 1; }
            66.67%  { transform: translate(890px, 480px); opacity: 1; }
            76.67%  { transform: translate(1055px, 480px); opacity: 1; }
            87.00%  { transform: translate(1055px, 480px); opacity: 1; }
            93.33%  { transform: translate(1055px, 480px); opacity: 0; }
            100%    { transform: translate(890px, 480px); opacity: 0; }
          }

          @keyframes bcAnimParcelBike {
            0%      { opacity: 0; }
            64.99%  { opacity: 0; }
            65.00%  { opacity: 1; }
            79.99%  { opacity: 1; }
            80.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimRiderOnBike {
            0%      { opacity: 0; }
            64.00%  { opacity: 1; }
            79.99%  { opacity: 1; }
            80.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimCourierWalking {
            0%      { transform: translate(1075px, 485px); opacity: 0; }
            79.99%  { transform: translate(1075px, 485px); opacity: 0; }
            80.00%  { transform: translate(1075px, 485px); opacity: 1; }
            83.33%  { transform: translate(1108px, 485px); opacity: 1; }
            85.00%  { transform: translate(1108px, 485px); opacity: 1; }
            86.67%  { transform: translate(1108px, 485px); opacity: 1; }
            93.33%  { transform: translate(1108px, 485px); opacity: 1; }
            96.67%  { transform: translate(1108px, 485px); opacity: 0; }
            100%    { transform: translate(1075px, 485px); opacity: 0; }
          }

          @keyframes bcAnimParcelDriver {
            0%      { opacity: 0; }
            79.99%  { opacity: 0; }
            80.00%  { opacity: 1; }
            84.99%  { opacity: 1; }
            85.00%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimReceiver {
            0%      { transform: translate(1130px, 485px); opacity: 0; }
            75.00%  { transform: translate(1130px, 485px); opacity: 1; }
            93.33%  { transform: translate(1130px, 485px); opacity: 1; }
            96.67%  { transform: translate(1130px, 485px); opacity: 0; }
            100%    { transform: translate(1130px, 485px); opacity: 0; }
          }

          @keyframes bcAnimParcelReceiver {
            0%      { opacity: 0; }
            84.99%  { opacity: 0; }
            85.00%  { opacity: 1; }
            93.33%  { opacity: 1; }
            96.67%  { opacity: 0; }
            100%    { opacity: 0; }
          }

          @keyframes bcAnimSuccessPulse {
            0%      { transform: scale(0.2); opacity: 0; }
            86.66%  { transform: scale(0.2); opacity: 0; }
            86.67%  { transform: scale(0.4); opacity: 0.9; }
            88.33%  { transform: scale(1.4); opacity: 0.6; }
            90.00%  { transform: scale(2.2); opacity: 0; }
            100%    { transform: scale(0.2); opacity: 0; }
          }

          @keyframes bcAnimTrackProgressFill {
            0%   { stroke-dashoffset: 800; }
            100% { stroke-dashoffset: 0; }
          }

          @keyframes bcAnimTrackProgressDot {
            0%   { transform: translateX(0px); }
            100% { transform: translateX(800px); }
          }

          .bc-track-fill-line {
            stroke-dasharray: 800;
            stroke-dashoffset: 800;
            animation: bcAnimTrackProgressFill 30s linear infinite;
            will-change: stroke-dashoffset;
          }

          .bc-track-dot-marker {
            animation: bcAnimTrackProgressDot 30s linear infinite;
            will-change: transform;
          }

          @keyframes bcLegSwingA {
            0%, 100% { transform: rotate(0deg); }
            25%       { transform: rotate(14deg); }
            50%       { transform: rotate(0deg); }
            75%       { transform: rotate(-14deg); }
          }
          @keyframes bcLegSwingB {
            0%, 100% { transform: rotate(0deg); }
            25%       { transform: rotate(-14deg); }
            50%       { transform: rotate(0deg); }
            75%       { transform: rotate(14deg); }
          }

          .bc-walk-leg-1 {
            transform-origin: 0 0;
            animation: bcLegSwingA 0.6s infinite ease-in-out;
          }

          .bc-walk-leg-2 {
            transform-origin: 0 0;
            animation: bcLegSwingB 0.6s infinite ease-in-out;
          }

          @keyframes bcWheelRoll {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }

          .bc-rolling-wheel {
            transform-origin: 0 0;
            animation: bcWheelRoll 0.4s infinite linear;
          }

          @keyframes bcArcDashFlow {
            from { stroke-dashoffset: 60; }
            to   { stroke-dashoffset: 0; }
          }

          .bc-arc-flow {
            stroke-dasharray: 6 6;
            animation: bcArcDashFlow 2s infinite linear;
          }

          /* Accessibility: Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            .bc-anim-carrier,
            .bc-track-fill-line,
            .bc-track-dot-marker,
            .bc-walk-leg-1,
            .bc-walk-leg-2,
            .bc-rolling-wheel,
            .bc-arc-flow {
              animation: none !important;
            }
          }
        `}</style>

        {/* Scalable SVG Graphics Canvas */}
        <svg
          className="bc-logistics-motion"
          viewBox="0 0 1200 675"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* MASTER REUSABLE PARCEL SYMBOL (Standardized 3D Isometric Logistics Box) */}
            <g id="parcel-art">
              {/* Top face (gold cardboard) */}
              <polygon fill="#fbbf24" points="0,-8 9,-3 0,2 -9,-3" stroke="#d97706" strokeLinejoin="round" strokeWidth="0.75" />
              {/* Left face (shaded gold/orange) */}
              <polygon fill="#f59e0b" points="-9,-3 0,2 0,11 -9,6" stroke="#d97706" strokeLinejoin="round" strokeWidth="0.75" />
              {/* Right face (deep orange shadow) */}
              <polygon fill="#d97706" points="0,2 9,-3 9,6 0,11" stroke="#b45309" strokeLinejoin="round" strokeWidth="0.75" />
              {/* BC Red tamper/security tape across box */}
              <polygon fill="#dc2626" opacity="0.9" points="-4,-5.5 0,-3.5 0,11 -4,9" />
              <polygon fill="#b91c1c" opacity="0.9" points="0,-3.5 4,-5.5 4,9 0,11" />
              {/* Cyan IoT telemetry chip indicator */}
              <circle cx="2" cy="-1.5" fill="#38bdf8" r="1.2" />
            </g>

            {/* SUBTLE BACKGROUND GLOWS & LINEAR GRADIENTS */}
            <linearGradient id="bcRoadGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="30%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="bcFlightCorridorGrad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* ========================================================
              LAYER 1: STATIC ENVIRONMENT & TECHNICAL GRID
              ======================================================== */}
          {/* Deep Navy Atmospheric Background */}
          <rect fill="#081325" height="675" width="1200" x="0" y="0" />

          {/* Minimalist Coordinate Matrix (Low opacity, clean background) */}
          <g opacity="0.08" stroke="#38bdf8" strokeDasharray="2 6" strokeWidth="0.5">
            <line x1="50" x2="50" y1="0" y2="675" />
            <line x1="250" x2="250" y1="0" y2="675" />
            <line x1="450" x2="450" y1="0" y2="675" />
            <line x1="650" x2="650" y1="0" y2="675" />
            <line x1="850" x2="850" y1="0" y2="675" />
            <line x1="1050" x2="1050" y1="0" y2="675" />
            <line x1="0" x2="1200" y1="200" y2="200" />
            <line x1="0" x2="1200" y1="400" y2="400" />
          </g>

          {/* Transcontinental Great-Circle Flight Path (Arc between Station 2 and Station 3) */}
          <path
            className="bc-arc-flow"
            d="M 495 440 C 560 210, 800 210, 855 440"
            fill="none"
            id="masterFlightArc"
            stroke="url(#bcFlightCorridorGrad)"
            strokeWidth="1.75"
          />

          {/* Arterial Ground Logistics Highway (Continuous Baseline y=485) */}
          <rect fill="url(#bcRoadGradient)" height="24" width="1200" x="0" y="485" />
          <line stroke="#334155" strokeWidth="1.5" x1="0" x2="1200" y1="485" y2="485" />
          <line stroke="#1e293b" strokeWidth="1" x1="0" x2="1200" y1="509" y2="509" />
          {/* Amber Dashed Center Line */}
          <line opacity="0.8" stroke="#f59e0b" strokeDasharray="14 10" strokeWidth="2" x1="0" x2="1200" y1="497" y2="497" />

          {/* ========================================================
              LAYER 2: FIXED LOGISTICS INFRASTRUCTURE & NODES
              ======================================================== */}
          {/* STATION 1: BC CARGO OFFICE (School Road, Hetauda) */}
          <g id="station-1" transform="translate(60, 395)">
            <rect fill="#0b192c" height="90" rx="4" stroke="#1e293b" strokeWidth="1.5" width="120" x="0" y="0" />
            <rect fill="#0f2444" height="32" rx="2" stroke="#38bdf8" strokeWidth="0.8" width="40" x="12" y="18" />
            <rect fill="#081325" height="66" rx="2" stroke="#334155" strokeWidth="1" width="38" x="68" y="24" />
            <rect fill="#1e293b" height="30" stroke="#475569" strokeWidth="0.8" width="30" x="60" y="60" />
            <rect fill="#dc2626" height="15" rx="3" width="120" x="0" y="0" />
            <text fill="#ffffff" fontSize="8.5" fontWeight="800" letterSpacing="0.8" textAnchor="middle" x="60" y="11">
              BC CARGO OFFICE
            </text>
            {/* Static Counter Indicator Spot */}
            <ellipse cx="75" cy="58" fill="#38bdf8" opacity="0.3" rx="8" ry="2" />
            {/* Static Counter Parcel Instance */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelCounter' }}>
              <g transform="translate(75, 55)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* Station 1 Labels */}
          <text className="bc-station-title" x="120" y="525">BC Cargo Office</text>
          <text className="bc-station-sub" x="120" y="538">School Road, Hetauda</text>

          {/* STATION 2: KATHMANDU WAREHOUSE & SORTING HUB */}
          <g id="station-2" transform="translate(420, 385)">
            <rect fill="#0b192c" height="90" rx="4" stroke="#1e293b" strokeWidth="1.5" width="130" x="0" y="10" />
            <rect fill="#081325" height="72" rx="2" stroke="#334155" strokeWidth="1" width="55" x="18" y="28" />
            {/* Inspection Terminal Bay */}
            <rect fill="#0f172a" height="42" rx="2" stroke="#1e3a8a" strokeWidth="0.8" width="35" x="85" y="28" />
            <circle cx="102.5" cy="40" fill="#38bdf8" opacity="0.8" r="3.5" />
            <line stroke="#334155" strokeWidth="1" x1="92" x2="113" y1="52" y2="52" />
            <line stroke="#334155" strokeWidth="1" x1="92" x2="108" y1="58" y2="58" />
            {/* Brand Top Crest */}
            <polygon fill="#1e3a8a" points="65,0 120,10 10,10" stroke="#3b82f6" strokeWidth="0.8" />
            <rect fill="#1e293b" height="12" rx="2" stroke="#38bdf8" strokeWidth="0.75" width="80" x="25" y="6" />
            <text fill="#38bdf8" fontSize="8" fontWeight="800" letterSpacing="0.8" textAnchor="middle" x="65" y="15">
              WAREHOUSE
            </text>
          </g>

          {/* Station 2 Labels */}
          <text className="bc-station-title" x="485" y="525">Warehouse</text>
          <text className="bc-station-sub" x="485" y="538">2. Kathmandu</text>

          {/* STATION 3: DESTINATION WAREHOUSE (Selected Country) */}
          <g id="station-3" transform="translate(800, 385)">
            <rect fill="#0b192c" height="90" rx="4" stroke="#1e293b" strokeWidth="1.5" width="130" x="0" y="10" />
            <rect fill="#081325" height="72" rx="2" stroke="#334155" strokeWidth="1" width="60" x="16" y="28" />
            <circle cx="102" cy="24" fill="none" r="10" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1" />
            <line stroke="#f59e0b" strokeWidth="1.2" x1="102" x2="108" y1="24" y2="18" />
            <polygon fill="#0f2444" points="65,0 120,10 10,10" stroke="#d97706" strokeWidth="0.8" />
            <rect fill="#1e293b" height="12" rx="2" stroke="#f59e0b" strokeWidth="0.75" width="80" x="25" y="6" />
            <text fill="#f59e0b" fontSize="8" fontWeight="800" letterSpacing="0.8" textAnchor="middle" x="65" y="15">
              WAREHOUSE
            </text>
          </g>

          {/* Station 3 Labels */}
          <text className="bc-station-title" x="865" y="525">Warehouse</text>
          <text className="bc-station-sub" x="865" y="538">3. Selected Country</text>

          {/* STATION 4: RECEIVER HOUSE (Final Handover) */}
          <g id="station-4" transform="translate(1080, 395)">
            <rect fill="#0b192c" height="90" rx="4" stroke="#1e293b" strokeWidth="1.5" width="85" x="0" y="0" />
            <rect fill="#081325" height="68" rx="2" stroke="#10b981" strokeWidth="1" width="38" x="25" y="22" />
            <circle cx="44" cy="14" fill="#10b981" opacity="0.8" r="3" />
            {/* Crisp single rounded rect for RECEIVER HOUSE badge */}
            <rect fill="#0b192c" height="16" rx="3" stroke="#10b981" strokeWidth="1" width="85" x="0" y="-16" />
            <text className="bc-station-tag" fill="#10b981" textAnchor="middle" x="42.5" y="-5">
              RECEIVER HOUSE
            </text>
          </g>

          {/* Station 4 Labels */}
          <text className="bc-station-title" x="1122" y="525">RECEIVER HOUSE</text>
          <text className="bc-station-sub" fill="#10b981" x="1122" y="538">4. Final Handover</text>

          {/* ========================================================
              LAYER 3: CARRIERS & PHYSICAL ATTACHMENT GROUPS
              ======================================================== */}
          {/* 1. CUSTOMER CARRIER */}
          <g className="bc-anim-carrier" id="customer-carrier" style={{ animationName: 'bcAnimCustomer' }}>
            <rect fill="#475569" height="18" rx="2" width="12" x="-6" y="-30" />
            <circle cx="0" cy="-38" fill="#38bdf8" r="6" />
            <line className="bc-walk-leg-1" stroke="#334155" strokeLinecap="round" strokeWidth="3" x1="-3" x2="-5" y1="-12" y2="0" />
            <line className="bc-walk-leg-2" stroke="#334155" strokeLinecap="round" strokeWidth="3" x1="3" x2="5" y1="-12" y2="0" />
            <line stroke="#38bdf8" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="16" y1="-24" y2="-17" />
            <circle cx="16" cy="-17" fill="#38bdf8" r="2" />
            {/* Attached Parcel in Customer's Hand */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelCustomer' }}>
              <g transform="translate(20, -21)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 2. OFFICE STAFF CARRIER */}
          <g className="bc-anim-carrier" id="staff-carrier" style={{ animationName: 'bcAnimStaff' }}>
            <rect fill="#dc2626" height="18" rx="2" width="12" x="-6" y="-30" />
            <circle cx="0" cy="-38" fill="#f59e0b" r="6" />
            <line className="bc-walk-leg-2" stroke="#1e293b" strokeLinecap="round" strokeWidth="3" x1="-3" x2="-4" y1="-12" y2="0" />
            <line className="bc-walk-leg-1" stroke="#1e293b" strokeLinecap="round" strokeWidth="3" x1="3" x2="4" y1="-12" y2="0" />
            <line stroke="#dc2626" strokeLinecap="round" strokeWidth="2.5" x1="3" x2="15" y1="-24" y2="-17" />
            <circle cx="15" cy="-17" fill="#f59e0b" r="2" />
            {/* Attached Parcel in Staff's Hand */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelStaff' }}>
              <g transform="translate(19, -21)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 3. LINE-HAUL TRUCK CARRIER */}
          <g className="bc-anim-carrier" id="truck-carrier" style={{ animationName: 'bcAnimTruck' }}>
            <g id="truck-body">
              <rect fill="#0d1b2a" height="38" rx="2" stroke="#1e293b" strokeWidth="1.2" width="76" x="-70" y="-38" />
              <rect fill="#dc2626" height="8" width="76" x="-70" y="-28" />
              <text fill="#ffffff" fontSize="6.5" fontWeight="900" letterSpacing="0.5" textAnchor="middle" x="-32" y="-22">
                BC CARGO
              </text>
              <rect fill="#1e293b" height="32" stroke="#334155" strokeWidth="0.5" width="6" x="-70" y="-35" />
              <polygon fill="#1e3a8a" points="6,0 6,-32 20,-32 28,-14 28,0" stroke="#3b82f6" strokeWidth="1" />
              <polygon fill="#38bdf8" opacity="0.75" points="12,-30 18,-30 25,-15 12,-15" />
              <circle cx="28" cy="-5" fill="#fbbf24" r="2" />
              <polygon fill="#fbbf24" opacity="0.15" points="28,-5 50,-10 50,0" />
              {/* Wheels */}
              <g transform="translate(-56, 4)">
                <circle cx="0" cy="0" fill="#0f172a" r="7" stroke="#334155" strokeWidth="1.5" />
                <circle className="bc-rolling-wheel" cx="0" cy="0" fill="#64748b" r="3" />
              </g>
              <g transform="translate(-38, 4)">
                <circle cx="0" cy="0" fill="#0f172a" r="7" stroke="#334155" strokeWidth="1.5" />
                <circle className="bc-rolling-wheel" cx="0" cy="0" fill="#64748b" r="3" />
              </g>
              <g transform="translate(18, 4)">
                <circle cx="0" cy="0" fill="#0f172a" r="7" stroke="#334155" strokeWidth="1.5" />
                <circle className="bc-rolling-wheel" cx="0" cy="0" fill="#64748b" r="3" />
              </g>
            </g>
            {/* Attached Parcel in Truck Cargo Bed */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelTruck' }}>
              <g transform="translate(-60, -10)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 4. AIRPLANE CARRIER (Follows M 495 440 C 560 210, 800 210, 855 440 with precision tangents) */}
          <g className="bc-anim-carrier" id="airplane-carrier" style={{ animationName: 'bcAnimAirplane' }}>
            <g id="airplane-fuselage">
              {/* Conventional Jet Aircraft Fuselage */}
              <path
                d="M -30,-4 Q -32,-7 -36,-16 L -28,-16 L -22,-3 L 14,-3 Q 28,-3 36,0 Q 28,3 14,3 L -24,3 Q -28,3 -30,-4 Z"
                fill="#ffffff"
                stroke="#94a3b8"
                strokeWidth="0.8"
              />
              {/* Cockpit Window Visor */}
              <path d="M 22,-2.5 L 29,-1 L 28,0 L 21,-1 Z" fill="#0284c7" />
              {/* BC Cargo Livery Ribbon along fuselage */}
              <line stroke="#dc2626" strokeWidth="1.8" x1="-20" x2="22" y1="0.5" y2="0.5" />
              {/* Port & Starboard Swept Main Wings */}
              <polygon fill="#e2e8f0" points="-6,-2 4,-2 10,-20 -2,-20" stroke="#94a3b8" strokeWidth="0.75" />
              <polygon fill="#cbd5e1" points="-6,2 4,2 10,20 -2,20" stroke="#94a3b8" strokeWidth="0.75" />
              {/* Underslung Turbofan Jet Engines */}
              <rect fill="#334155" height="4.5" rx="1.5" stroke="#1e293b" strokeWidth="0.5" width="11" x="0" y="-14" />
              <rect fill="#334155" height="4.5" rx="1.5" stroke="#1e293b" strokeWidth="0.5" width="11" x="0" y="9.5" />
              {/* Horizontal Stabilizer */}
              <polygon fill="#94a3b8" points="-30,1 -24,1 -31,8 -35,8" />
              {/* Tail Fin Red Cap */}
              <polygon fill="#dc2626" points="-36,-16 -28,-16 -26,-11 -34,-11" />
            </g>
            {/* Attached Parcel in Aircraft Cargo Bay */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelAirplane' }}>
              <g transform="translate(0, 0) scale(0.85)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 5. DELIVERY MOTORCYCLE CARRIER */}
          <g className="bc-anim-carrier" id="bike-carrier" style={{ animationName: 'bcAnimMotorcycle' }}>
            <g id="bike-chassis">
              {/* Rear Delivery Cargo Box */}
              <rect fill="#0b192c" height="20" rx="2" stroke="#dc2626" strokeWidth="1.2" width="20" x="-28" y="-30" />
              <rect fill="#dc2626" height="4" width="20" x="-28" y="-22" />
              <text fill="#ffffff" fontSize="3.5" fontWeight="900" textAnchor="middle" x="-18" y="-19">
                BC
              </text>
              {/* Frame & Tank */}
              <polygon fill="#1e3a8a" points="-8,-12 4,-14 12,-18 16,-8 6,-4 -8,-4" stroke="#2563eb" strokeWidth="0.8" />
              <line stroke="#475569" strokeLinecap="round" strokeWidth="1.8" x1="8" x2="13" y1="-16" y2="-24" />
              <line stroke="#94a3b8" strokeLinecap="round" strokeWidth="2" x1="10" x2="16" y1="-23" y2="-23" />
              <circle cx="16" cy="-10" fill="#fbbf24" r="1.5" />
              <line stroke="#94a3b8" strokeLinecap="round" strokeWidth="2" x1="-12" x2="-26" y1="-2" y2="1" />
              {/* Wheels */}
              <g transform="translate(-18, 0)">
                <circle cx="0" cy="0" fill="#0f172a" r="6" stroke="#334155" strokeWidth="1.5" />
                <circle className="bc-rolling-wheel" cx="0" cy="0" fill="#94a3b8" r="2.5" />
              </g>
              <g transform="translate(14, 0)">
                <circle cx="0" cy="0" fill="#0f172a" r="6" stroke="#334155" strokeWidth="1.5" />
                <circle className="bc-rolling-wheel" cx="0" cy="0" fill="#94a3b8" r="2.5" />
              </g>
            </g>
            {/* Attached Parcel in Motorcycle Rear Cargo Box */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelBike' }}>
              <g transform="translate(-18, -20) scale(0.9)">
                <use href="#parcel-art" />
              </g>
            </g>
            {/* Mounted Rider on Bike */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimRiderOnBike' }}>
              <polygon fill="#dc2626" points="-6,-12 4,-12 8,-28 -2,-28" />
              <circle cx="4" cy="-35" fill="#0b192c" r="5.5" stroke="#38bdf8" strokeWidth="0.8" />
              <polygon fill="#38bdf8" points="5,-36 9,-36 8,-33 5,-33" />
              <polyline fill="none" points="0,-12 6,-6 -2,0" stroke="#1e293b" strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" />
              <polyline fill="none" points="4,-24 10,-20 12,-23" stroke="#dc2626" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
            </g>
          </g>

          {/* 6. STANDING / WALKING COURIER */}
          <g className="bc-anim-carrier" id="driver-carrier" style={{ animationName: 'bcAnimCourierWalking' }}>
            <rect fill="#dc2626" height="18" rx="2" width="10" x="-5" y="-30" />
            <circle cx="0" cy="-37" fill="#0b192c" r="5.5" stroke="#38bdf8" strokeWidth="0.8" />
            <polygon fill="#38bdf8" points="1,-38 5,-38 4,-35 1,-35" />
            <line className="bc-walk-leg-1" stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" x1="-2" x2="-4" y1="-12" y2="0" />
            <line className="bc-walk-leg-2" stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="4" y1="-12" y2="0" />
            <line stroke="#dc2626" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="14" y1="-24" y2="-17" />
            <circle cx="14" cy="-17" fill="#fbbf24" r="2" />
            {/* Attached Parcel in Courier's Extended Hand */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelDriver' }}>
              <g transform="translate(18, -21)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 7. RECEIVER CARRIER & FINAL HANDOVER */}
          <g className="bc-anim-carrier" id="receiver-carrier" style={{ animationName: 'bcAnimReceiver' }}>
            <rect fill="#334155" height="18" rx="2" width="10" x="-5" y="-30" />
            <circle cx="0" cy="-37" fill="#10b981" r="5.5" />
            <line stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" x1="-2" x2="-2" y1="-12" y2="0" />
            <line stroke="#1e293b" strokeLinecap="round" strokeWidth="2.5" x1="2" x2="2" y1="-12" y2="0" />
            <line stroke="#334155" strokeLinecap="round" strokeWidth="2.5" x1="-2" x2="-8" y1="-24" y2="-17" />
            <circle cx="-8" cy="-17" fill="#10b981" r="2" />
            {/* Attached Parcel Securely Held by Receiver */}
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimParcelReceiver' }}>
              <g transform="translate(-4, -21)">
                <use href="#parcel-art" />
              </g>
            </g>
          </g>

          {/* 8. EMERALD SUCCESS CONFIRMATION RIPPLE */}
          <g transform="translate(1125, 464)">
            <g className="bc-anim-carrier" style={{ animationName: 'bcAnimSuccessPulse' }}>
              <circle cx="0" cy="0" fill="none" r="24" stroke="#10b981" strokeWidth="2.5" />
              <circle cx="0" cy="0" fill="#10b981" opacity="0.25" r="14" />
              <polyline fill="none" points="-5,0 -1,4 6,-4" stroke="#10b981" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </g>
          </g>

          {/* ========================================================
              LAYER 4: BOTTOM TECHNICAL PROGRESS TIMELINE
              ======================================================== */}
          <g id="bottom-timeline" transform="translate(200, 585)">
            {/* Progress Bar Background Track */}
            <line stroke="#1e293b" strokeLinecap="round" strokeWidth="4" x1="0" x2="800" y1="2" y2="2" />
            {/* Continuous Progress Fill (Uses stroke-dashoffset across 30.0s) */}
            <line className="bc-track-fill-line" stroke="#38bdf8" strokeLinecap="round" strokeWidth="4" x1="0" x2="800" y1="2" y2="2" />
            {/* Traveling Progress Pointer Dot */}
            <g className="bc-track-dot-marker">
              <circle cx="0" cy="2" fill="#38bdf8" r="5" stroke="#081325" strokeWidth="1.5" />
            </g>
            {/* Milepost Milestone Nodes */}
            <circle cx="0" cy="2" fill="#dc2626" r="3.5" />
            <circle cx="160" cy="2" fill="#f59e0b" r="3.5" />
            <circle cx="320" cy="2" fill="#38bdf8" r="3.5" />
            <circle cx="480" cy="2" fill="#38bdf8" r="3.5" />
            <circle cx="640" cy="2" fill="#f59e0b" r="3.5" />
            <circle cx="800" cy="2" fill="#10b981" r="3.5" />
            {/* Progress Text */}
            <text className="bc-timeline-text" x="400" y="26">
              Dropoff ➔ Truck Route ➔ Kathmandu Hub ➔ Flight ➔ Destination Country ➔ Local Courier ➔ Safely Delivered
            </text>
          </g>
        </svg>

      </div>
    </section>
  );
};
