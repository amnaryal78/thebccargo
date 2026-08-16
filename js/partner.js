(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('partnerApplicationForm');
    const submitBtn = document.getElementById('submitPartnerBtn');
    const statusMsg = document.getElementById('partnerStatusMessage');
    const API_BASE = window.API_BASE_URL || window.location.origin;

    if (!form) return;

    function showStatus(msg, type) {
      if (statusMsg) {
        statusMsg.textContent = msg;
        statusMsg.className = `partner-status-msg show ${type}`;
        statusMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function hideStatus() {
      if (statusMsg) {
        statusMsg.textContent = '';
        statusMsg.className = 'partner-status-msg';
      }
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const company_name = document.getElementById('partnerCompany')?.value.trim();
      const country = document.getElementById('partnerCountry')?.value;
      const first_name = document.getElementById('partnerFirstName')?.value.trim();
      const last_name = document.getElementById('partnerLastName')?.value.trim();
      const email = document.getElementById('partnerEmail')?.value.trim();
      const phone = document.getElementById('partnerPhone')?.value.trim();
      const details = document.getElementById('partnerDetails')?.value.trim() || '';

      if (!company_name || !country || !first_name || !last_name || !email || !phone) {
        showStatus('❌ Please fill in all required fields marked with an asterisk (*).', 'error');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showStatus('❌ Please enter a valid email address.', 'error');
        return;
      }

      const origBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Submitting Application...';
      hideStatus();

      try {
        let res = await fetch(`${API_BASE}/api/public/partner-apply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ company_name, country, first_name, last_name, email, phone, details })
        });

        if (res.status === 404) {
          res = await fetch(`${API_BASE}/api/partner-application`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ company_name, country, first_name, last_name, email, phone, details })
          });
        }

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.success) {
          showStatus(`✅ ${data.message || 'Thank you! Your international partnership application has been submitted successfully.'}`, 'success');
          form.reset();
        } else {
          showStatus(`❌ ${data.message || 'Submission failed. Please check your details and try again.'}`, 'error');
        }
      } catch (err) {
        console.error('Partner application submission error:', err);
        showStatus('❌ Network error. Please check your internet connection and try again.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnHtml;
      }
    });
  });
})();
