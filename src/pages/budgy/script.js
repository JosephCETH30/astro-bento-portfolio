// Initialize PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

// DOM Elements
const pdfInput = document.getElementById('pdfInput');
const pdfFileName = document.getElementById('pdfFileName');
const summaryCard = document.getElementById('summaryCard');
const chartsSection = document.getElementById('chartsSection');
const calculateBtn = document.getElementById('calculateBtn');
const saveBtn = document.getElementById('saveBtn');
const loadBtn = document.getElementById('loadBtn');
const resetBtn = document.getElementById('resetBtn');
const transactionHistory = document.getElementById('transactionHistory');
const budgetAnalysis = document.getElementById('budgetAnalysis');
const savingsRecommendations = document.getElementById('savingsRecommendations');
const expenseOptimization = document.getElementById('expenseOptimization');
const financialGoals = document.getElementById('financialGoals');

// Chart instances
let barChart, pieChart;

// Transaction history array
let transactions = [];

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Load budget from local storage if available
    if(localStorage.getItem('budgetData')) {
        loadBudget();
    }
    
    // Load transactions from local storage if available
    if(localStorage.getItem('transactions')) {
        transactions = JSON.parse(localStorage.getItem('transactions'));
        updateTransactionHistory();
    }
    
    // PDF file input change handler
    pdfInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            pdfFileName.textContent = e.target.files[0].name;
            parsePDF(e.target.files[0]);
        } else {
            pdfFileName.textContent = 'No file chosen';
        }
    });

    // Button event listeners
    calculateBtn.addEventListener('click', calculateBudget);
    saveBtn.addEventListener('click', saveBudget);
    loadBtn.addEventListener('click', loadBudget);
    resetBtn.addEventListener('click', () => resetBudget(true));

    // Dynamic field buttons
    document.querySelectorAll('.add-field-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.getAttribute('data-container');
            const type = this.getAttribute('data-type');
            addField(container, type);
        });
    });

    document.querySelectorAll('.remove-field-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const container = this.getAttribute('data-container');
            removeField(this, container);
        });
    });

    // Tab navigation
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Add transaction form handling
    const addTransactionBtn = document.querySelector('#history-tab button');
    if (addTransactionBtn) {
        addTransactionBtn.addEventListener('click', function() {
            const dateInput = document.querySelector('#history-tab input[type="date"]');
            const categorySelect = document.querySelector('#history-tab select');
            const descriptionInput = document.createElement('input');
            const amountInput = document.createElement('input');
            
            descriptionInput.type = 'text';
            descriptionInput.placeholder = 'Description';
            descriptionInput.className = 'px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400';
            
            amountInput.type = 'number';
            amountInput.placeholder = 'Amount';
            amountInput.className = 'px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400';
            
            const form = document.createElement('div');
            form.className = 'flex gap-3 mt-4';
            form.appendChild(descriptionInput);
            form.appendChild(amountInput);
            
            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Add';
            submitBtn.className = 'px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition';
            submitBtn.addEventListener('click', function() {
                if (dateInput.value && categorySelect.value && descriptionInput.value && amountInput.value) {
                    addTransaction(dateInput.value, categorySelect.value, descriptionInput.value, amountInput.value);
                    form.remove();
                    dateInput.value = '';
                    categorySelect.value = '';
                } else {
                    alert('Please fill in all fields');
                }
            });
            
            form.appendChild(submitBtn);
            document.querySelector('#history-tab .space-y-4').appendChild(form);
        });
    }
});

// Switch between tabs
function switchTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    // Remove active state from all buttons
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('bg-emerald-600');
        button.classList.add('bg-slate-700');
    });
    
    // Show selected tab content
    document.getElementById(tabId).classList.remove('hidden');
    
    // Set active state on selected button
    document.querySelector(`[data-tab="${tabId}"]`).classList.remove('bg-slate-700');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('bg-emerald-600');
}

// Add new input field
function addField(containerId, type) {
    const container = document.getElementById(containerId);
    const newField = document.createElement('div');
    newField.className = 'flex gap-3 mt-3';
    
    if (type === 'income') {
        newField.innerHTML = `
            <input type="text" name="incomeSource[]" placeholder="Source" class="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <input type="number" name="incomeAmount[]" placeholder="Amount" class="w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <button type="button" class="remove-field-btn px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition" data-container="${containerId}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
    } else if (type === 'fixedExpense') {
        newField.innerHTML = `
            <input type="text" name="fixedExpenseName[]" placeholder="Expense" class="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <input type="number" name="fixedExpenseAmount[]" placeholder="Amount" class="w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <button type="button" class="remove-field-btn px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition" data-container="${containerId}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
    } else if (type === 'variableExpense') {
        newField.innerHTML = `
            <input type="text" name="variableExpenseName[]" placeholder="Expense" class="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <input type="number" name="variableExpenseAmount[]" placeholder="Amount" class="w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <button type="button" class="remove-field-btn px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition" data-container="${containerId}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
    } else if (type === 'savings') {
        newField.innerHTML = `
            <input type="text" name="savingsGoal[]" placeholder="Goal" class="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <input type="number" name="savingsAmount[]" placeholder="Amount" class="w-32 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-200 placeholder-gray-400">
            <button type="button" class="remove-field-btn px-3 py-2 bg-red-900/50 text-red-400 rounded-lg hover:bg-red-900/70 transition" data-container="${containerId}">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </button>
        `;
    }
    
    container.appendChild(newField);
    
    // Add event listener to the new remove button
    newField.querySelector('.remove-field-btn').addEventListener('click', function() {
        removeField(this, containerId);
    });
}

// Remove input field
function removeField(button, containerId) {
    const container = document.getElementById(containerId);
    if (container.children.length > 1) {
        button.parentElement.remove();
    } else {
        alert('You need to have at least one field.');
    }
}

// Calculate budget
function calculateBudget() {
    // Get all input values
    const income = parseFloat(document.getElementById('income').value) || 0;
    const fixedExpenses = Array.from(document.querySelectorAll('#fixedExpenses input[type="number"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    const variableExpenses = Array.from(document.querySelectorAll('#variableExpenses input[type="number"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);
    const savingsGoals = Array.from(document.querySelectorAll('#savingsGoals input[type="number"]'))
        .reduce((sum, input) => sum + (parseFloat(input.value) || 0), 0);

    // Calculate totals
    const totalExpenses = fixedExpenses + variableExpenses;
    const totalSavings = savingsGoals;
    const remaining = income - totalExpenses - totalSavings;

    // Update summary card
    summaryCard.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-slate-800 p-4 rounded-lg">
                <h3 class="text-emerald-400 font-semibold">Total Income</h3>
                <p class="text-2xl text-white">$${income.toFixed(2)}</p>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg">
                <h3 class="text-emerald-400 font-semibold">Total Expenses</h3>
                <p class="text-2xl text-white">$${totalExpenses.toFixed(2)}</p>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg">
                <h3 class="text-emerald-400 font-semibold">Total Savings</h3>
                <p class="text-2xl text-white">$${totalSavings.toFixed(2)}</p>
            </div>
            <div class="bg-slate-800 p-4 rounded-lg">
                <h3 class="text-emerald-400 font-semibold">Remaining</h3>
                <p class="text-2xl ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}">$${remaining.toFixed(2)}</p>
            </div>
        </div>
    `;

    // Create charts
    createCharts(income, fixedExpenses, variableExpenses, totalSavings);

    // Generate AI insights
    generateAIInsights(income, fixedExpenses, variableExpenses, totalSavings, remaining);

    // Show results
    summaryCard.classList.remove('hidden');
    chartsSection.classList.remove('hidden');
}

function createCharts(income, fixedExpenses, variableExpenses, savings) {
    const ctx = document.getElementById('budgetChart').getContext('2d');
    const pieCtx = document.getElementById('expensePieChart').getContext('2d');

    // Destroy existing charts if they exist
    if (barChart) barChart.destroy();
    if (pieChart) pieChart.destroy();

    // Bar Chart
    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Income', 'Fixed Expenses', 'Variable Expenses', 'Savings'],
            datasets: [{
                label: 'Amount ($)',
                data: [income, fixedExpenses, variableExpenses, savings],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#e2e8f0'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: '#e2e8f0'
                    },
                    grid: {
                        color: 'rgba(148, 163, 184, 0.1)'
                    }
                }
            }
        }
    });

    // Pie Chart
    pieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Fixed Expenses', 'Variable Expenses', 'Savings'],
            datasets: [{
                data: [fixedExpenses, variableExpenses, savings],
                backgroundColor: [
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(245, 158, 11)',
                    'rgb(59, 130, 246)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#e2e8f0'
                    }
                }
            }
        }
    });
}

function generateAIInsights(income, fixedExpenses, variableExpenses, savings, remaining) {
    // Budget Analysis
    const expenseRatio = ((fixedExpenses + variableExpenses) / income) * 100;
    const savingsRatio = (savings / income) * 100;
    
    budgetAnalysis.innerHTML = `
        <div class="space-y-4">
            <p class="text-gray-300">Your total expenses are ${expenseRatio.toFixed(1)}% of your income.</p>
            <p class="text-gray-300">You're saving ${savingsRatio.toFixed(1)}% of your income.</p>
            <p class="text-gray-300">${remaining >= 0 ? 'Great job! You have money left over.' : 'You need to reduce expenses or increase income.'}</p>
        </div>
    `;

    // Savings Recommendations
    const recommendedSavings = income * 0.2; // 20% of income
    savingsRecommendations.innerHTML = `
        <div class="space-y-4">
            <p class="text-gray-300">Recommended savings: $${recommendedSavings.toFixed(2)} (20% of income)</p>
            <p class="text-gray-300">${savings >= recommendedSavings ? 'Great job meeting the savings goal!' : 'Consider increasing your savings to reach the recommended amount.'}</p>
        </div>
    `;

    // Expense Optimization
    const highExpenseCategories = [];
    if (fixedExpenses > income * 0.5) highExpenseCategories.push('fixed expenses');
    if (variableExpenses > income * 0.3) highExpenseCategories.push('variable expenses');
    
    expenseOptimization.innerHTML = `
        <div class="space-y-4">
            <p class="text-gray-300">${highExpenseCategories.length > 0 ? 
                `Consider reducing your ${highExpenseCategories.join(' and ')}.` : 
                'Your expenses are well-balanced.'}</p>
            <p class="text-gray-300">${variableExpenses > fixedExpenses ? 
                'Your variable expenses are higher than fixed expenses. Consider setting a stricter budget.' : 
                'Your fixed expenses are well-managed.'}</p>
        </div>
    `;

    // Financial Goals
    financialGoals.innerHTML = `
        <div class="space-y-4">
            <p class="text-gray-300">Short-term goal: Build an emergency fund of 3-6 months of expenses.</p>
            <p class="text-gray-300">Medium-term goal: Increase savings rate to 20% of income.</p>
            <p class="text-gray-300">Long-term goal: Achieve financial independence through consistent saving and investing.</p>
        </div>
    `;
}

// Save budget
function saveBudget() {
    const budgetData = {
        income: [],
        fixedExpenses: [],
        variableExpenses: [],
        savings: []
    };

    // Save income data
    const incomeSources = document.getElementsByName('incomeSource[]');
    const incomeAmounts = document.getElementsByName('incomeAmount[]');
    incomeSources.forEach((source, index) => {
        if (source.value || incomeAmounts[index].value) {
            budgetData.income.push({
                source: source.value,
                amount: incomeAmounts[index].value
            });
        }
    });

    // Save fixed expenses data
    const fixedExpenseNames = document.getElementsByName('fixedExpenseName[]');
    const fixedExpenseAmounts = document.getElementsByName('fixedExpenseAmount[]');
    fixedExpenseNames.forEach((name, index) => {
        if (name.value || fixedExpenseAmounts[index].value) {
            budgetData.fixedExpenses.push({
                name: name.value,
                amount: fixedExpenseAmounts[index].value
            });
        }
    });

    // Save variable expenses data
    const variableExpenseNames = document.getElementsByName('variableExpenseName[]');
    const variableExpenseAmounts = document.getElementsByName('variableExpenseAmount[]');
    variableExpenseNames.forEach((name, index) => {
        if (name.value || variableExpenseAmounts[index].value) {
            budgetData.variableExpenses.push({
                name: name.value,
                amount: variableExpenseAmounts[index].value
            });
        }
    });

    // Save savings data
    const savingsGoals = document.getElementsByName('savingsGoal[]');
    const savingsAmounts = document.getElementsByName('savingsAmount[]');
    savingsGoals.forEach((goal, index) => {
        if (goal.value || savingsAmounts[index].value) {
            budgetData.savings.push({
                goal: goal.value,
                amount: savingsAmounts[index].value
            });
        }
    });

    // Save to local storage
    localStorage.setItem('budgetData', JSON.stringify(budgetData));
    alert('Budget saved successfully!');
}

// Load budget
function loadBudget() {
    const savedData = localStorage.getItem('budgetData');
    if (savedData) {
        const budgetData = JSON.parse(savedData);
        
        // Clear existing fields
        resetBudget(false);
        
        // Load income data
        budgetData.income.forEach(item => {
            addField('incomeFields', 'income');
            const fields = document.querySelectorAll('#incomeFields > div');
            const lastField = fields[fields.length - 1];
            lastField.querySelector('input[name="incomeSource[]"]').value = item.source;
            lastField.querySelector('input[name="incomeAmount[]"]').value = item.amount;
        });
        
        // Load fixed expenses data
        budgetData.fixedExpenses.forEach(item => {
            addField('fixedExpenseFields', 'fixedExpense');
            const fields = document.querySelectorAll('#fixedExpenseFields > div');
            const lastField = fields[fields.length - 1];
            lastField.querySelector('input[name="fixedExpenseName[]"]').value = item.name;
            lastField.querySelector('input[name="fixedExpenseAmount[]"]').value = item.amount;
        });
        
        // Load variable expenses data
        budgetData.variableExpenses.forEach(item => {
            addField('variableExpenseFields', 'variableExpense');
            const fields = document.querySelectorAll('#variableExpenseFields > div');
            const lastField = fields[fields.length - 1];
            lastField.querySelector('input[name="variableExpenseName[]"]').value = item.name;
            lastField.querySelector('input[name="variableExpenseAmount[]"]').value = item.amount;
        });
        
        // Load savings data
        budgetData.savings.forEach(item => {
            addField('savingsFields', 'savings');
            const fields = document.querySelectorAll('#savingsFields > div');
            const lastField = fields[fields.length - 1];
            lastField.querySelector('input[name="savingsGoal[]"]').value = item.goal;
            lastField.querySelector('input[name="savingsAmount[]"]').value = item.amount;
        });
        
        // Calculate budget with loaded data
        calculateBudget();
    } else {
        alert('No saved budget found.');
    }
}

// Reset budget
function resetBudget(clearStorage = true) {
    // Clear all input fields
    document.querySelectorAll('input[type="text"], input[type="number"]').forEach(input => {
        input.value = '';
    });
    
    // Remove all extra fields except the first one
    ['incomeFields', 'fixedExpenseFields', 'variableExpenseFields', 'savingsFields'].forEach(containerId => {
        const container = document.getElementById(containerId);
        while (container.children.length > 1) {
            container.removeChild(container.lastChild);
        }
    });
    
    // Hide summary and charts
    summaryCard.classList.add('hidden');
    chartsSection.classList.add('hidden');
    
    // Clear local storage if requested
    if (clearStorage) {
        localStorage.removeItem('budgetData');
    }
}

// Parse PDF file
function parsePDF(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const typedarray = new Uint8Array(e.target.result);
        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                pdf.getPage(i).then(function(page) {
                    page.getTextContent().then(function(content) {
                        content.items.forEach(function(item) {
                            text += item.str + ' ';
                        });
                        if (i === pdf.numPages) {
                            extractDataFromPDF(text);
                        }
                    });
                });
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

// Extract data from PDF text
function extractDataFromPDF(text) {
    // This is a simple example. You would need to implement more sophisticated
    // parsing logic based on the structure of your PDF files.
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.includes('Income') || line.includes('Salary')) {
            // Try to extract income data
            const amount = line.match(/\$?\d+(\.\d{2})?/);
            if (amount) {
                addField('incomeFields', 'income');
                const fields = document.querySelectorAll('#incomeFields > div');
                const lastField = fields[fields.length - 1];
                lastField.querySelector('input[name="incomeAmount[]"]').value = amount[0].replace('$', '');
            }
        }
    });
}

// Add transaction to history
function addTransaction(date, category, description, amount) {
    const transaction = {
        date,
        category,
        description,
        amount: parseFloat(amount),
        id: Date.now()
    };
    
    transactions.push(transaction);
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateTransactionHistory();
}

// Update transaction history table
function updateTransactionHistory() {
    if (!transactionHistory) return;
    
    transactionHistory.innerHTML = transactions.length ? 
        transactions.map(transaction => `
            <div class="flex justify-between items-center p-4 bg-slate-800 rounded-lg">
                <div>
                    <p class="text-emerald-400">${transaction.description}</p>
                    <p class="text-sm text-gray-400">${transaction.date} - ${transaction.category}</p>
                </div>
                <div class="flex items-center gap-4">
                    <p class="text-white">$${transaction.amount.toFixed(2)}</p>
                    <button onclick="deleteTransaction(${transaction.id})" class="text-red-400 hover:text-red-300">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `).join('') :
        '<p class="text-gray-400 text-center">No transactions yet</p>';
}

// Delete transaction
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    updateTransactionHistory();
}