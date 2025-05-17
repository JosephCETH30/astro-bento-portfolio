const firebaseConfig = {
  apiKey: "AIzaSyArzlL453j2qprYeoa-q0pV5cyfzKcQrcY",
  authDomain: "budgettracker-62a78.firebaseapp.com",
  projectId: "budgettracker-62a78",
  storageBucket: "budgettracker-62a78.appspot.com",
  messagingSenderId: "944373038211",
  appId: "1:944373038211:web:bced5c2ec39615ddf76fb6",
  measurementId: "G-30JJZTHYTR"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
}