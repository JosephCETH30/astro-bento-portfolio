// Authentication functions
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  auth.onAuthStateChanged(user => {
    if (user && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
      window.location.href = 'dashboard.html';
    }
  });

  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = loginForm['email'].value;
      const password = loginForm['password'].value;
      
      auth.signInWithEmailAndPassword(email, password)
        .then(() => {
          window.location.href = 'dashboard.html';
        })
        .catch(error => {
          showLoginError(error.message);
        });
    });
  }

  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      const name = registerForm['name'].value;
      const email = registerForm['email'].value;
      const password = registerForm['password'].value;
      const confirmPassword = registerForm['confirm-password'].value;
      
      // Validate passwords match
      if (password !== confirmPassword) {
        showRegisterError('Passwords do not match');
        return;
      }
      
      // Create user
      auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
          // Add user to Firestore
          return db.collection('users').doc(cred.user.uid).set({
            name: name,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        })
        .then(() => {
          window.location.href = 'dashboard.html';
        })
        .catch(error => {
          showRegisterError(error.message);
        });
    });
  }
});

function showLoginError(message) {
  const errorDiv = document.getElementById('loginError');
  const errorText = document.getElementById('loginErrorText');
  errorText.textContent = message;
  errorDiv.classList.remove('hidden');
  setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}

function showRegisterError(message) {
  const errorDiv = document.getElementById('registerError');
  const errorText = document.getElementById('registerErrorText');
  errorText.textContent = message;
  errorDiv.classList.remove('hidden');
  setTimeout(() => errorDiv.classList.add('hidden'), 5000);
}