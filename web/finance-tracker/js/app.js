// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const savingsEl = document.getElementById('savings');
const transactionsList = document.getElementById('transactions-list');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const settingsBtn = document.getElementById('settings-btn');
const transactionModal = document.getElementById('transaction-modal');
const budgetModal = document.getElementById('budget-modal');
const closeBtns = document.querySelectorAll('.close-btn');
const transactionForm = document.getElementById('transaction-form');
const budgetForm = document.getElementById('budget-form');
const transactionTypeBtns = document.querySelectorAll('.toggle-btn');
const transactionTypeInput = document.getElementById('transaction-type');
const loadingSpinner = document.getElementById('loadingSpinner');
const monthlyBudgetInput = document.getElementById('monthly-budget');
const budgetCategoriesContainer = document.getElementById('budget-categories');
const addCategoryBtn = document.getElementById('add-category');

// App data
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let monthlyBudget = JSON.parse(localStorage.getItem('monthlyBudget')) || 0;
let lastMonthData = JSON.parse(localStorage.getItem('lastMonthData')) || {
    income: 0,
    expense: 0,
    savings: 0
};

// Initialize the app
function init() {
    // Initialize budget if not set
    if (monthlyBudget === 0) {
        monthlyBudget = prompt('Please set your monthly budget:', '2000');
        if (monthlyBudget) {
            monthlyBudget = parseFloat(monthlyBudget);
            localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
        } else {
            monthlyBudget = 2000; // Default budget
        }
    }
    
    // Update budget display
    document.getElementById('total-budget').textContent = `$${monthlyBudget.toFixed(2)}`;
    
    updateUI();
    setupEventListeners();
    
    // Check if it's a new month
    checkNewMonth();
}

// Update UI with transaction data
function updateUI() {
    showLoading();
    try {
        // Validate transactions data
        if (!Array.isArray(transactions)) {
            throw new Error('Invalid transactions data');
        }
        
        // Update UI components
        updateBalance();
        renderTransactions();
        updateCharts();
        
        // Save to localStorage with error handling
        try {
            saveToLocalStorage();
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            showNotification('Warning: Could not save data locally', 'warning');
        }
        
    } catch (error) {
        console.error('Error updating UI:', error);
        showNotification('Error updating application data', 'error');
    } finally {
        hideLoading();
    }
}

// Check if it's a new month and reset data if needed
function checkNewMonth() {
    const now = new Date();
    const lastAccess = localStorage.getItem('lastAccess');
    
    if (lastAccess) {
        const lastDate = new Date(parseInt(lastAccess));
        if (lastDate.getMonth() !== now.getMonth() || lastDate.getFullYear() !== now.getFullYear()) {
            // It's a new month, save last month's data and reset transactions
            const amounts = calculateAmounts();
            lastMonthData = {
                income: amounts.income,
                expense: amounts.expense,
                savings: amounts.savings
            };
            localStorage.setItem('lastMonthData', JSON.stringify(lastMonthData));
            transactions = [];
            updateUI();
        }
    }
    
    localStorage.setItem('lastAccess', now.getTime());
}

// Calculate financial amounts
function calculateAmounts() {
    const amounts = transactions.map(t => ({
        ...t,
        amount: parseFloat(t.amount)
    }));
    
    const total = amounts.reduce((acc, item) => acc + item.amount, 0);
    const income = amounts
        .filter(item => item.type === 'income')
        .reduce((acc, item) => acc + item.amount, 0);
        
    const expense = Math.abs(amounts
        .filter(item => item.type === 'expense')
        .reduce((acc, item) => acc + item.amount, 0));
    
    const savings = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;
    
    return { total, income, expense, savings };
}

// Calculate trends compared to last month
function calculateTrends(current, last) {
    if (last === 0) return 0; // Avoid division by zero
    return ((current - last) / last * 100).toFixed(1);
}

// Update balance, income, and expense
function updateBalance() {
    const { total, income, expense, savings } = calculateAmounts();
    
    // Calculate trends
    const incomeTrend = lastMonthData.income > 0 ? 
        calculateTrends(income, lastMonthData.income) : 0;
    const expenseTrend = lastMonthData.expense > 0 ? 
        calculateTrends(expense, lastMonthData.expense) : 0;
        
    // Update trend indicators
    document.getElementById('income-change').textContent = `${Math.abs(incomeTrend)}%`;
    document.getElementById('expense-change').textContent = `${Math.abs(expenseTrend)}%`;
    document.getElementById('savings-trend').textContent = 
        incomeTrend > 0 ? 'Increasing' : (incomeTrend < 0 ? 'Decreasing' : 'Stable');
        
    // Update budget progress
    const budgetUsed = (expense / monthlyBudget * 100).toFixed(1);
    const remainingBudget = monthlyBudget - expense;
    
    document.getElementById('budget-remaining').textContent = 
        `$${Math.max(0, remainingBudget).toFixed(2)}`;
    document.getElementById('budget-progress').style.width = 
        `${Math.min(100, budgetUsed)}%`;
    
    // Change progress bar color based on usage
    const progressBar = document.getElementById('budget-progress');
    if (budgetUsed > 90) {
        progressBar.style.background = 'var(--danger-color)';
    } else if (budgetUsed > 70) {
        progressBar.style.background = 'var(--warning-color)';
    } else {
        progressBar.style.background = 'var(--success-color)';
    }
    
    balanceEl.textContent = formatCurrency(total);
    incomeEl.textContent = `+${formatCurrency(income)}`;
    expenseEl.textContent = `-${formatCurrency(expense)}`;
    savingsEl.textContent = `${savings}%`;
}

// Render transactions list
function renderTransactions(filteredTransactions = null) {
    const transactionsToRender = filteredTransactions || transactions;
    
    if (transactionsToRender.length === 0) {
        transactionsList.innerHTML = '<div class="no-transactions">No transactions found</div>';
        return;
    }
    
    transactionsList.innerHTML = transactionsToRender
        .map(transaction => createTransactionHTML(transaction))
        .join('');
}

// Create HTML for a single transaction
function createTransactionHTML(transaction) {
    const isIncome = transaction.type === 'income';
    const amountClass = isIncome ? 'positive' : 'negative';
    const sign = isIncome ? '+' : '-';
    
    return `
        <div class="transaction-item" data-id="${transaction.id}">
            <div class="transaction-info">
                <div class="transaction-category">${formatCategory(transaction.category)}</div>
                <div class="transaction-description">${transaction.description}</div>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transaction-amount ${amountClass}">
                ${sign}${formatCurrency(transaction.amount)}
                <button class="delete-btn" data-id="${transaction.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `;
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Format category
function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
}

// Save data to localStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
    localStorage.setItem('lastMonthData', JSON.stringify(lastMonthData));
}

// Export transactions to CSV
function exportToCSV() {
    if (transactions.length === 0) {
        showNotification('No transactions to export', 'warning');
        return;
    }
    
    // CSV header
    let csvContent = 'Date,Type,Category,Description,Amount\n';
    
    // Add transactions
    transactions.forEach(transaction => {
        const row = [
            transaction.date || new Date().toISOString().split('T')[0],
            transaction.type,
            transaction.category || 'Uncategorized',
            `"${transaction.description.replace(/"/g, '""')}"`,
            Math.abs(transaction.amount).toFixed(2)
        ];
        csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];
    
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${date}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Transactions exported successfully!', 'success');
}

// Setup event listeners
function setupEventListeners() {
    // Add transaction button
    addTransactionBtn.addEventListener('click', openTransactionModal);
    
    // Settings button
    settingsBtn.addEventListener('click', openBudgetSettings);

    // Close modal buttons
    closeBtns.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Export button
    document.getElementById('export-btn').addEventListener('click', exportToCSV);
    
    // Add category button
    addCategoryBtn.addEventListener('click', addBudgetCategory);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === transactionModal || e.target === budgetModal) {
            closeAllModals();
        }
    });
    
    // Budget form submission
    budgetForm.addEventListener('submit', handleBudgetSubmit);

    // Transaction type toggle buttons
    transactionTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            transactionTypeInput.value = type;
            
            // Update active state
            transactionTypeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Form submission
    transactionForm.addEventListener('submit', handleFormSubmit);
    
    // Filter functionality
    const filterInput = document.getElementById('filter');
    filterInput.addEventListener('input', filterTransactions);
    
    // Sort functionality
    const sortSelect = document.getElementById('sort');
    sortSelect.addEventListener('change', filterTransactions);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// Handle form submission with error handling
function handleFormSubmit(e) {
    e.preventDefault();
    
    try {
        const description = document.getElementById('description').value.trim();
        const amountInput = document.getElementById('amount').value.trim();
        const type = document.getElementById('transaction-type').value;
        const category = document.getElementById('category').value;
        const dateInput = document.getElementById('date').value;
        
        // Input validation
        if (!description) {
            throw new Error('Please enter a description');
        }
        
        if (!amountInput) {
            throw new Error('Please enter an amount');
        }
        
        const amount = parseFloat(amountInput);
        if (isNaN(amount) || amount <= 0) {
            throw new Error('Please enter a valid positive amount');
        }
        
        // Date validation
        const date = dateInput || new Date().toISOString().split('T')[0];
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate > today) {
            throw new Error('Cannot add transactions for future dates');
        }
        
        const transaction = {
            id: Date.now(),
            description,
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            type,
            category,
            date
        };
        
        // Add transaction with optimistic UI update
        showLoading();
        transactions.unshift(transaction);
        
        // Simulate API call with error handling
        setTimeout(() => {
            try {
                // In a real app, this would be an API call
                updateUI();
                transactionForm.reset();
                closeTransactionModal();
                showNotification('Transaction added successfully!', 'success');
            } catch (error) {
                // Revert optimistic update on error
                transactions.shift();
                updateUI();
                showNotification('Failed to add transaction. Please try again.', 'error');
                console.error('Transaction error:', error);
            } finally {
                hideLoading();
            }
        }, 500);
        
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Show notification to user
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        notification.addEventListener('transitionend', () => notification.remove());
    }, 3000);
}

// Modal functions
function openTransactionModal() {
    closeAllModals();
    transactionModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.getElementById('description').focus();
}

function openBudgetSettings() {
    closeAllModals();
    loadBudgetSettings();
    budgetModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    transactionModal.style.display = 'none';
    budgetModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadBudgetSettings() {
    // Load current budget
    monthlyBudgetInput.value = monthlyBudget;
    
    // Load categories
    budgetCategoriesContainer.innerHTML = '';
    const categories = [...new Set(transactions.map(t => t.category).filter(Boolean))];
    
    if (categories.length === 0) {
        categories.push('Food', 'Shopping', 'Bills', 'Transportation', 'Entertainment');
    }
    
    categories.forEach(category => addBudgetCategory(category));
}

function addBudgetCategory(category = '') {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-item';
    categoryDiv.innerHTML = `
        <input type="text" value="${category}" placeholder="Category name" class="category-input">
        <button type="button" class="btn btn-icon remove-category" title="Remove category">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    const removeBtn = categoryDiv.querySelector('.remove-category');
    removeBtn.addEventListener('click', () => categoryDiv.remove());
    
    budgetCategoriesContainer.appendChild(categoryDiv);
}

function handleBudgetSubmit(e) {
    e.preventDefault();
    
    // Update monthly budget
    monthlyBudget = parseFloat(monthlyBudgetInput.value) || 0;
    localStorage.setItem('monthlyBudget', JSON.stringify(monthlyBudget));
    
    // Update categories
    const categoryInputs = budgetCategoriesContainer.querySelectorAll('.category-input');
    const categories = Array.from(categoryInputs)
        .map(input => input.value.trim())
        .filter(Boolean);
    
    // Update the category dropdown in transaction form
    updateCategoryDropdown(categories);
    
    // Close modal and update UI
    closeAllModals();
    updateUI();
    showNotification('Budget settings saved successfully!', 'success');
}

function updateCategoryDropdown(categories) {
    const filterSelect = document.getElementById('filter-category');
    const transactionSelect = document.getElementById('category');
    
    // Clear existing options except the first one
    while (filterSelect.options.length > 1) filterSelect.remove(1);
    while (transactionSelect.options.length > 1) transactionSelect.remove(1);
    
    // Add new categories
    categories.forEach(category => {
        if (category) {
            const option = document.createElement('option');
            option.value = category.toLowerCase();
            option.textContent = category;
            
            // Clone for transaction form
            const option2 = option.cloneNode(true);
            
            filterSelect.appendChild(option);
            transactionSelect.appendChild(option2);
        }
    });
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
    }

    // Ctrl+Enter or Cmd+Enter to add new transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        openTransactionModal();
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && transactionModal.style.display === 'block') {
        closeTransactionModal();
    }
    
    // Space to generate new transaction (if needed)
    if (e.key === ' ' && transactionModal.style.display !== 'block') {
        e.preventDefault();
        // Add any quick action for space if needed
    }
}

// Filter transactions
function filterTransactions() {
    const type = document.getElementById('filter-type').value;
    const category = document.getElementById('filter-category').value;
    
    let filtered = [...transactions];
    
    if (type !== 'all') {
        filtered = filtered.filter(t => t.type === type);
    }
    
    if (category !== 'all') {
        filtered = filtered.filter(t => t.category === category);
    }
    
    renderTransactions(filtered);
}

// Initialize charts
function updateCharts() {
    // This will be implemented with Chart.js
    console.log('Updating charts...');
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    showLoading();
    // Simulate loading time (1 second)
    setTimeout(() => {
        init();
        hideLoading();
    }, 1000);
});

// Delete transaction event listener
document.addEventListener('click', (e) => {
    if (e.target.closest('.delete-btn')) {
        const id = e.target.closest('.delete-btn').dataset.id;
        transactions = transactions.filter(t => t.id !== id);
        updateUI();
    }
});

// Show loading spinner
function showLoading() {
    loadingSpinner.classList.add('active');
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.classList.remove('active');
}

