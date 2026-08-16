(function () {
  'use strict';

  function filterJobs(category, pill) {
    const pills = document.querySelectorAll('.filter-pill');
    pills.forEach(p => p.classList.remove('active'));
    if (pill) pill.classList.add('active');

    const cards = document.querySelectorAll('.job-card');
    cards.forEach(card => {
      if (category === 'all' || card.getAttribute('data-dept') === category) {
        card.style.display = 'flex';
      } else {
        card.style.display = 'none';
      }
    });
  }

  function openApplyModal(jobTitle) {
    const posTitle = document.getElementById('modalPositionTitle');
    const jobTitleInput = document.getElementById('formJobTitle');
    const successAlert = document.getElementById('modalSuccessAlert');
    const form = document.getElementById('careersApplyForm');
    const modal = document.getElementById('applyModal');
    if (!modal) return;
    if (posTitle) posTitle.textContent = jobTitle;
    if (jobTitleInput) jobTitleInput.value = jobTitle;
    if (successAlert) successAlert.style.display = 'none';
    if (form) form.style.display = 'block';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeApplyModal() {
    const modal = document.getElementById('applyModal');
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    const form = document.getElementById('careersApplyForm');
    if (!form) return;
    const submitBtn = form.querySelector('[type="submit"]');
    const successAlert = document.getElementById('modalSuccessAlert');
    const position = document.getElementById('formJobTitle')?.value || document.getElementById('modalPositionTitle')?.textContent || 'General Application';
    const name = document.getElementById('applicantName')?.value.trim();
    const email = document.getElementById('applicantEmail')?.value.trim();
    const phone = document.getElementById('applicantPhone')?.value.trim();
    const experience = document.getElementById('applicantExp')?.value;
    const note = document.getElementById('applicantNote')?.value.trim();

    if (!name || !email || !phone) {
      alert('Please fill in all required fields (Full Name, Email, Phone Number).');
      return;
    }

    const btnOriginalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting Application...';
    }

    try {
      const apiBase = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : window.location.origin;
      const response = await fetch(`${apiBase}/api/public/careers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          email: email,
          phone: phone,
          position: position,
          experience: experience,
          cover_letter: note
        })
      });

      const resData = await response.json().catch(() => ({}));

      if (response.ok && resData.success) {
        if (form) form.style.display = 'none';
        if (successAlert) {
          successAlert.textContent = '✅ ' + (resData.message || 'Thank you! Your application has been submitted successfully.');
          successAlert.style.display = 'block';
        }
        form.reset();
        setTimeout(() => {
          closeApplyModal();
        }, 3000);
      } else {
        alert('❌ Submission failed: ' + (resData.message || 'Server error. Please try again.'));
      }
    } catch (err) {
      console.error('Career application submission error:', err);
      alert('❌ Network error. Please check your internet connection and try again.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = btnOriginalText;
      }
    }
  }

  async function loadJobs() {
    const grid = document.getElementById('jobsGrid');
    if (!grid) return;

    let jobs = [];
    try {
      const apiBase = (typeof API_BASE_URL !== 'undefined' && API_BASE_URL) ? API_BASE_URL : window.location.origin;
      const response = await fetch(`${apiBase}/api/public/jobs`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.jobs)) jobs = data.jobs;
      }
    } catch (err) {
      console.error('Job listings load error:', err);
    }

    if (jobs.length === 0) {
      grid.innerHTML = '<p class="empty-state-msg" role="status">No open positions right now. Please check back soon or submit a general application below.</p>';
      return;
    }

    const deptLabels = {
      fleet: 'Drivers & Fleet',
      operations: 'Operations & Dispatch',
      warehouse: 'Supply Chain & Warehouse'
    };

    grid.innerHTML = jobs.map(job => {
      const dept = job.department || 'operations';
      const title = String(job.title || '');
      const type = String(job.type || 'Full-Time');
      const location = String(job.location || '');
      const desc = String(job.description || '');
      const tags = Array.isArray(job.tags) && job.tags.length
        ? job.tags.map(t => `<span class="job-tag">${String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`).join('')
        : '';
      return `
        <div class="job-card" data-dept="${String(dept).replace(/"/g, '&quot;')}">
            <div>
                <div class="job-header-top">
                    <span class="job-badge">${String(deptLabels[dept] || dept).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                    <span class="job-type-badge">${type.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>
                </div>
                <h3 class="job-title">${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h3>
                <div class="job-location">
                    <i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${location.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                </div>
                <p class="job-desc">${desc.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                <div class="job-tags">${tags}</div>
            </div>
            <button class="btn btn-primary btn-apply" data-job-title="${title.replace(/"/g, '&quot;')}">
                <i class="fas fa-paper-plane" aria-hidden="true"></i> Apply Now
            </button>
        </div>
      `;
    }).join('');
  }

  function initCareersPage() {
    loadJobs();

    document.addEventListener('click', (e) => {
      const pill = e.target.closest('.filter-pill[data-dept]');
      if (pill) {
        filterJobs(pill.getAttribute('data-dept'), pill);
        return;
      }

      const applyBtn = e.target.closest('.btn-apply[data-job-title], [data-open-apply][data-job-title]');
      if (applyBtn) {
        openApplyModal(applyBtn.getAttribute('data-job-title'));
        return;
      }

      if (e.target.closest('.modal-close-btn')) {
        closeApplyModal();
        return;
      }

      const modal = document.getElementById('applyModal');
      if (modal && e.target === modal) closeApplyModal();
    });

    document.getElementById('careersApplyForm')?.addEventListener('submit', handleFormSubmit);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeApplyModal();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCareersPage);
  } else {
    initCareersPage();
  }
})();
