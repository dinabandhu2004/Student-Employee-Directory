let currentDirectory = 'student'; // Default directory

// Highlight submit button briefly on click
function highlightSubmitBtn() {
  const submitBtn = document.getElementById('submit');
  if (!submitBtn) return;
  submitBtn.addEventListener('click', () => {
    submitBtn.style.backgroundColor = 'rgba(0, 212, 255, 1)';
    setTimeout(() => {
      submitBtn.style.backgroundColor = 'white';
    }, 100);
  });
}

// Toggle menu options visibility
function setupMenuToggle() {
  const menuIcon = document.querySelector('.menu-icon');
  const menuOptions = document.querySelector('.menu-options');
  if (menuIcon && menuOptions) {
    menuIcon.addEventListener('click', () => {
      menuOptions.classList.toggle('show');
    });
  }
}

// Load directory HTML form (Student or Employee)
function loadDirectoryForm() {
  const htmlFile = currentDirectory === 'student' ? 'StudentDirectory.html' : 'EmployeeDirectory.html';
  return fetch(htmlFile)
    .then(res => res.text())
    .then(html => {
      document.getElementById('directory').innerHTML = html;
      highlightSubmitBtn();
      setupSearchInput();
      
    });
}

// Fetch and display directory data filtered by search term
function loadDirectoryData(filter = '') {
  fetch(`/data/${currentDirectory}?search=` + encodeURIComponent(filter.trim()))
    .then(res => res.json())
    .then(users => {
      const dir = document.getElementById('directory');
      if (!dir) return;

      // Remove existing user cards if any
      const existingCards = dir.querySelectorAll('.card');
      existingCards.forEach(card => card.remove());

      // Append user cards after form and search bar
      const container = document.createElement('div');
      container.id = 'user-cards-container';

      users.forEach(user => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
          <div>
            <img src="uploads/${user.photo}" alt="Photo of ${user.name}" />
          </div>
          <div class="card-info">
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Department:</strong> ${user.department}</p>
            <p><strong>Contact:</strong> ${user.contact}</p>
          </div>
        `;

        container.appendChild(card);
      });

      dir.appendChild(container);
    })
    .catch(err => {
      console.error('Error loading directory data:', err);
    });
}

// Set up search input to load filtered data on input
function setupSearchInput() {
  const searchInput = document.getElementById('search');
  if (!searchInput) return;

  searchInput.addEventListener('input', () => {
    loadDirectoryData(searchInput.value);
  });
}

// Set up buttons to switch between Student and Employee directories
function setupDirectorySwitch() {
  document.querySelectorAll('.options-choose').forEach(btn => {
    btn.addEventListener('click', () => {
      currentDirectory = btn.textContent.toLowerCase().includes('student') ? 'student' : 'employee';
      loadDirectoryForm()
        .then(() => loadDirectoryData(''));
    });
  });
}

// On DOM content loaded, initialize everything
document.addEventListener('DOMContentLoaded', () => {
  setupMenuToggle();
  setupDirectorySwitch();

  // Load default Student directory form and data
  loadDirectoryForm()
    .then(() => loadDirectoryData(''));
});
