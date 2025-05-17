// auth.js with enhanced error handling and state management
document.addEventListener('DOMContentLoaded', function() {
  // Initialize Firebase
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  // Auth state observer
  auth.onAuthStateChanged((user) => {
    if (user) {
      // User is signed in
      if (window.location.pathname.includes('login.html') || 
          window.location.pathname.includes('register.html')) {
        window.location.href = 'dashboard.html';
      }
    } else {
      // User is signed out
      if (window.location.pathname.includes('dashboard.html')) {
        window.location.href = 'login.html';
      }
    }
  });

  // Show error message
  function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    const errorText = document.getElementById(elementId + 'Text');
    if (errorDiv && errorText) {
      errorText.textContent = message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => errorDiv.classList.add('hidden'), 5000);
    } else {
      alert(message);
    }
  }

  // Handle register form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = registerForm['email'].value.trim();
      const password = registerForm['password'].value;
      const confirmPassword = registerForm['confirm-password'].value;

      // Validation
      if (!email || !password || !confirmPassword) {
        showError('registerError', 'Please fill in all fields');
        return;
      }

      if (password.length < 6) {
        showError('registerError', 'Password should be at least 6 characters');
        return;
      }

      if (password !== confirmPassword) {
        showError('registerError', 'Passwords do not match');
        return;
      }

      try {
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await db.collection('users').doc(user.uid).set({
          email: email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        showError('registerError', 'Registration successful! Redirecting to login...');
        
        // Sign out the user
        await auth.signOut();
        
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);
      } catch (error) {
        console.error('Registration error:', error);
        let message = '';
        switch (error.code) {
          case 'auth/email-already-in-use':
            message = 'Email already registered';
            break;
          case 'auth/weak-password':
            message = 'Password should be at least 6 characters';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email format';
            break;
          default:
            message = 'Registration failed. Please try again';
        }
        showError('registerError', message);
      }
    });
  }

  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = loginForm['email'].value.trim();
      const password = loginForm['password'].value;

      if (!email || !password) {
        showError('loginError', 'Please fill in all fields');
        return;
      }

      try {
        // Sign in user
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Update last login in Firestore
        await db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error('Login error:', error);
        let message = '';
        switch (error.code) {
          case 'auth/user-not-found':
            message = 'No account found with this email';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password';
            break;
          case 'auth/invalid-email':
            message = 'Invalid email format';
            break;
          case 'auth/too-many-requests':
            message = 'Too many failed attempts. Please try again later';
            break;
          default:
            message = 'Login failed. Please try again';
        }
        showError('loginError', message);
      }
    });
  }
});