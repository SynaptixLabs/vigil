document.addEventListener('DOMContentLoaded', () => {
  // Navigation highlighting (optional, just to show some JS interaction)
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath.split('/').pop() || (currentPath.endsWith('/') && link.getAttribute('href') === 'index.html')) {
      link.style.fontWeight = 'bold';
    }
  });

  // Index Page - Hero Button
  const heroBtn = document.querySelector('[data-testid="hero-cta"]');
  if (heroBtn) {
    heroBtn.addEventListener('click', () => {
      alert('Hero clicked!');
    });
  }

  // Index Page - Item List clicks
  const listItems = document.querySelectorAll('[data-testid="item-list"] li');
  if (listItems.length > 0) {
    listItems.forEach(item => {
      item.addEventListener('click', (e) => {
        item.style.backgroundColor = '#e6f2ff';
        setTimeout(() => {
          item.style.backgroundColor = '';
        }, 500);
      });
    });
  }

  // Index Page - Delayed content (appears after 2s)
  const delayedContent = document.querySelector('[data-testid="delayed-content"]');
  if (delayedContent) {
    setTimeout(() => {
      delayedContent.classList.remove('hidden');
    }, 2000);
  }

  // Index Page - Expandable toggle section
  const toggleBtn = document.getElementById('toggle-btn');
  const toggleBody = document.getElementById('toggle-body');
  if (toggleBtn && toggleBody) {
    toggleBtn.addEventListener('click', () => {
      const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
      toggleBody.classList.toggle('hidden', isExpanded);
      toggleBtn.setAttribute('aria-expanded', String(!isExpanded));
      toggleBtn.textContent = isExpanded ? 'Show Details' : 'Hide Details';
    });
  }

  // Form Page - Validation and Submission
  const form = document.getElementById('test-form');
  const successMsg = document.querySelector('[data-testid="msg-success"]');
  
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.querySelector('[data-testid="input-name"]').value;
      const email = document.querySelector('[data-testid="input-email"]').value;
      const terms = document.querySelector('[data-testid="checkbox-terms"]').checked;
      
      if (!name || !email) {
        alert('Please fill out required fields');
        return;
      }
      
      if (!terms) {
        alert('You must accept the terms');
        return;
      }
      
      // Simulate form submission success
      successMsg.classList.remove('hidden');
      form.reset();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        successMsg.classList.add('hidden');
      }, 3000);
    });
  }
});
