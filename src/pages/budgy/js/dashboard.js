// Dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication state
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    } else {
      // Set welcome message
      db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
          document.getElementById('welcomeMessage').textContent = `Welcome back, ${doc.data().name}!`;
        }
      });
      
      // Load transactions
      loadTransactions(user.uid);
      
      // Set up event listeners
      setupEventListeners(user.uid);
    }
  });

  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  if (mobileMenuButton) {
    mobileMenuButton.addEventListener('click', function() {
      const mobileMenu = document.getElementById('mobile-menu');
      mobileMenu.classList.toggle('hidden');
      
      // Toggle icon
      const icon = this.querySelector('svg:not(.hidden)');
      const otherIcon = this.querySelector('svg.hidden');
      icon.classList.add('hidden');
      otherIcon.classList.remove('hidden');
    });
  }

  // Set today's date as default
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('date').value = today;
  document.getElementById('editDate').value = today;
});

function setupEventListeners(userId) {
  // Logout buttons
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  }
  
  if (mobileLogoutBtn) {
    mobileLogoutBtn.addEventListener('click', () => {
      auth.signOut().then(() => {
        window.location.href = 'login.html';
      });
    });
  }

  // Add transaction form
  const transactionForm = document.getElementById('transactionForm');
  if (transactionForm) {
    transactionForm.addEventListener('submit', e => {
      e.preventDefault();
      addTransaction(userId);
    });
  }

  // Filter transactions
  const filterType = document.getElementById('filterType');
  const filterCategory = document.getElementById('filterCategory');
  
  if (filterType) {
    filterType.addEventListener('change', () => {
      loadTransactions(userId);
    });
  }
  
  if (filterCategory) {
    filterCategory.addEventListener('change', () => {
      loadTransactions(userId);
    });
  }

  // Edit modal buttons
  const saveEditBtn = document.getElementById('saveEditBtn');
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', () => {
      updateTransaction(userId);
    });
  }
  
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      document.getElementById('editModal').classList.add('hidden');
    });
  }
}

function addTransaction(userId) {
  const transactionForm = document.getElementById('transactionForm');
  const type = transactionForm['type'].value;
  const title = transactionForm['title'].value;
  const amount = parseFloat(transactionForm['amount'].value);
  const category = transactionForm['category'].value;
  const date = transactionForm['date'].value;
  
  db.collection('users').doc(userId).collection('transactions').add({
    type: type,
    title: title,
    amount: amount,
    category: category,
    date: date,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    // Reset form
    transactionForm.reset();
    transactionForm['date'].value = new Date().toISOString().split('T')[0];
    
    // Reload transactions
    loadTransactions(userId);
  })
  .catch(error => {
    console.error('Error adding transaction: ', error);
  });
}

function loadTransactions(userId) {
  const transactionsList = document.getElementById('transactionsList');
  const filterType = document.getElementById('filterType').value;
  const filterCategory = document.getElementById('filterCategory').value;
  
  let query = db.collection('users').doc(userId).collection('transactions').orderBy('date', 'desc');
  
  // Apply filters
  if (filterType !== 'all') {
    query = query.where('type', '==', filterType);
  }
  
  if (filterCategory !== 'all') {
    query = query.where('category', '==', filterCategory);
  }
  
  query.onSnapshot(snapshot => {
    transactionsList.innerHTML = '';
    let totalIncome = 0;
    let totalExpenses = 0;
    
    if (snapshot.empty) {
      transactionsList.innerHTML = '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No transactions found</td></tr>';
    } else {
      snapshot.forEach(doc => {
        const transaction = doc.data();
        const transactionId = doc.id;
        const date = new Date(transaction.date);
        const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        
        // Calculate totals
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else {
          totalExpenses += transaction.amount;
        }
        
        // Create table row
        const row = document.createElement('tr');
        row.className = `transaction-${transaction.type}`;
        row.innerHTML = `
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center">
              <div class="text-sm font-medium text-gray-900">${transaction.title}</div>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500 capitalize">${transaction.category}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm text-gray-500">${formattedDate}</div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <div class="text-sm font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}">
              ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button class="text-mint-600 hover:text-mint-900 mr-3 edit-btn" data-id="${transactionId}">Edit</button>
            <button class="text-red-600 hover:text-red-900 delete-btn" data-id="${transactionId}">Delete</button>
          </td>
        `;
        
        transactionsList.appendChild(row);
      });
      
      // Add event listeners to edit and delete buttons
      document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', () => {
          editTransaction(userId, button.dataset.id);
        });
      });
      
      document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', () => {
          deleteTransaction(userId, button.dataset.id);
        });
      });
    }
    
    // Update summary
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;
    document.getElementById('balance').textContent = `$${(totalIncome - totalExpenses).toFixed(2)}`;
    
    // Update chart
    updateChart(userId);
  });
}

function editTransaction(userId, transactionId) {
  db.collection('users').doc(userId).collection('transactions').doc(transactionId).get()
    .then(doc => {
      if (doc.exists) {
        const transaction = doc.data();
        
        // Fill the edit form
        document.getElementById('editId').value = transactionId;
        document.getElementById('editType').value = transaction.type;
        document.getElementById('editTitle').value = transaction.title;
        document.getElementById('editAmount').value = transaction.amount;
        document.getElementById('editCategory').value = transaction.category;
        document.getElementById('editDate').value = transaction.date;
        
        // Show the modal
        document.getElementById('editModal').classList.remove('hidden');
      }
    })
    .catch(error => {
      console.error('Error getting transaction: ', error);
    });
}

function updateTransaction(userId) {
  const transactionId = document.getElementById('editId').value;
  const type = document.getElementById('editType').value;
  const title = document.getElementById('editTitle').value;
  const amount = parseFloat(document.getElementById('editAmount').value);
  const category = document.getElementById('editCategory').value;
  const date = document.getElementById('editDate').value;
  
  db.collection('users').doc(userId).collection('transactions').doc(transactionId).update({
    type: type,
    title: title,
    amount: amount,
    category: category,
    date: date
  })
  .then(() => {
    // Hide the modal
    document.getElementById('editModal').classList.add('hidden');
    
    // Reload transactions
    loadTransactions(userId);
  })
  .catch(error => {
    console.error('Error updating transaction: ', error);
  });
}

function deleteTransaction(userId, transactionId) {
  if (confirm('Are you sure you want to delete this transaction?')) {
    db.collection('users').doc(userId).collection('transactions').doc(transactionId).delete()
      .then(() => {
        // Reload transactions
        loadTransactions(userId);
      })
      .catch(error => {
        console.error('Error deleting transaction: ', error);
      });
  }
}