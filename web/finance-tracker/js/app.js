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

// Sample data (will be replaced with localStorage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize the app
function init() {
    updateUI();
    setupEventListeners();
}

// Update UI with transaction data
function updateUI() {
    updateBalance();
    renderTransactions();
    updateCharts();
    saveToLocalStorage();
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
    addTransactionBtn.addEventListener('click', () => {
        transactionModal.style.display = 'flex';
    });
    
    // Close modal
    closeBtn.addEventListener('click', () => {
        transactionModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === transactionModal) {
            transactionModal.style.display = 'none';
        }
    });
    
    // Toggle transaction type
    transactionTypeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            transactionTypeBtuns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            transactionTypeInput.value = btn.dataset.type;
        });
    });
    
    // Add new transaction
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
        const type = transactionTypeInput.value;
        
        const transaction = {
            id: Date.now().toString(),
            amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
            category,
            description,
            date,
            type
        };
        
        transactions.unshift(transaction);
        updateUI();
        transactionForm.reset();
        transactionModal.style.display = 'none';
    });
    
    // Delete transaction
    document.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn').dataset.id;
            transactions = transactions.filter(t => t.id !== id);
            updateUI();
        }
    });
    
    // Filter transactions
    document.getElementById('filter-type').addEventListener('change', filterTransactions);
    document.getElementById('filter-category').addEventListener('change', filterTransactions);
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
document.addEventListener('DOMContentLoaded', init);
