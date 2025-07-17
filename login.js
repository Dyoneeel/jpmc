document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorModal = document.getElementById('errorModal');
  const closeErrorModalBtn = document.getElementById('closeErrorModal');
  const errorMessage = document.getElementById('errorMessage');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('passwordToggle');

  // Show/hide password
  passwordToggle.addEventListener('click', function(e) {
    e.preventDefault();
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      passwordToggle.innerHTML = '<i class="fas fa-eye-slash"></i>';
    } else {
      passwordInput.type = 'password';
      passwordToggle.innerHTML = '<i class="fas fa-eye"></i>';
    }
  });

  // Login form submit
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = passwordInput.value;
    if (username === 'admin1' && password === 'jamespolymer0823') {
      window.location.href = 'index.html';
    } else {
      errorMessage.textContent = 'Invalid username or password. Please try again.';
      errorModal.style.display = 'flex';
    }
  });

  // Close error modal
  closeErrorModalBtn.addEventListener('click', function() {
    errorModal.style.display = 'none';
  });

  // Allow closing modal with Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && errorModal.style.display === 'flex') {
      errorModal.style.display = 'none';
    }
  });
}); 