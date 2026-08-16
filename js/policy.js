(function () {
  'use strict';

  function initPolicyTabs() {
    const tabs = document.querySelectorAll('.policy-tab-btn');
    const blocks = document.querySelectorAll('.policy-block');
    if (!tabs.length && !blocks.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', function () {
        const targetId = this.getAttribute('data-target');
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');

        blocks.forEach(block => {
          if (block.id === targetId) {
            block.style.display = 'block';
          } else {
            block.style.display = 'none';
          }
        });
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPolicyTabs);
  } else {
    initPolicyTabs();
  }
})();
