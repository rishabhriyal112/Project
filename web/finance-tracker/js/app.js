// DOM Elements
const balanceEl = document.getElementById('balance');
const incomeEl = document.getElementById('income');
const expenseEl = document.getElementById('expense');
const savingsEl = document.getElementById('savings');
const transactionsList = document.getElementById('transactions-list');
const addTransactionBtn = document.getElementById('add-transaction-btn');
const transactionModal = document.getElementById('transaction-modal');
const closeBtn = document.querySelector('.close-btn');
const transactionForm = document.getElementById('transaction-form');
const transactionTypeBtns = document.querySelectorAll('.toggle-btn');
const transactionTypeInput = document.getElementById('transaction-type');
const loadingSpinner = document.getElementById('loadingSpinner');

// Sample data (will be replaced with localStorage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize the app
function init() {
    updateUI();
    setupEventListeners();
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

// Update balance, income, and expense
function updateBalance() {
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

// Save transactions to localStorage
function saveToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Setup event listeners
function setupEventListeners() {
    // Add transaction button
    addTransactionBtn.addEventListener('click', openTransactionModal);

    // Close modal button
    closeBtn.addEventListener('click', closeTransactionModal);

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            closeTransactionModal();
        }
    });

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

// Open transaction modal
function openTransactionModal() {
    transactionModal.style.display = 'block';
    document.getElementById('description').focus();
}

// Close transaction modal
function closeTransactionModal() {
    transactionModal.style.display = 'none';
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

