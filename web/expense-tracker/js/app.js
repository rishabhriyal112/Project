// DOM Elements
const balanceEl = document.getElementById('balance');
const moneyPlusEl = document.getElementById('money-plus');
const moneyMinusEl = document.getElementById('money-minus');
const transactionListEl = document.getElementById('transaction-list');
const form = document.getElementById('form');
const textInput = document.getElementById('text');
const amountInput = document.getElementById('amount');

// Sample transactions (will be loaded from localStorage)
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

// Initialize the app
function init() {
  // Clear the transaction list
  transactionListEl.innerHTML = '';
  
  // Add each transaction to the DOM
  transactions.forEach(addTransactionToDOM);
  
  // Update the balance, income, and expense
  updateValues();
}

// Add a new transaction
function addTransaction(e) {
  e.preventDefault();
  
  // Validate inputs
  if (textInput.value.trim() === '' || amountInput.value.trim() === '') {
    alert('Please add a text and amount');
    return;
  }
  
  // Create a transaction object
  const transaction = {
    id: generateID(),
    text: textInput.value,
    amount: +amountInput.value // Convert to number
  };
  
  // Add the transaction to the array
  transactions.push(transaction);
  
  // Add the transaction to the DOM
  addTransactionToDOM(transaction);
  
  // Update the balance, income, and expense
  updateValues();
  
  // Update localStorage
  updateLocalStorage();
  
  // Clear the form
  textInput.value = '';
  amountInput.value = '';
  
  // Focus on the text input
  textInput.focus();
}

// Generate a random ID
function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// Add a transaction to the DOM
function addTransactionToDOM(transaction) {
  // Get the sign (positive or negative)
  const sign = transaction.amount < 0 ? '-' : '+';
  const amount = Math.abs(transaction.amount).toFixed(2);
  
  // Create a list item
  const item = document.createElement('li');
  item.classList.add('transaction-item');
  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  
  // Add the transaction HTML
  item.innerHTML = `
    ${transaction.text} 
    <span>${sign}$${amount}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">
        <i class="fas fa-times"></i>
      </button>
    </span>
  `;
  
  // Add the transaction to the DOM
  transactionListEl.appendChild(item);
}

// Update the balance, income, and expense
function updateValues() {
  // Get the amounts from the transactions array
  const amounts = transactions.map(transaction => transaction.amount);
  
  // Calculate the total balance
  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2);
  
  // Calculate the total income
  const income = amounts
    .filter(item => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2);
  
  // Calculate the total expense
  const expense = (
    amounts
      .filter(item => item < 0)
      .reduce((acc, item) => (acc += item), 0) * -1
  ).toFixed(2);
  
  // Update the DOM
  balanceEl.textContent = `$${total}`;
  moneyPlusEl.textContent = `+$${income}`;
  moneyMinusEl.textContent = `-$${expense}`;
}

// Remove a transaction by ID
function removeTransaction(id) {
  // Remove the transaction from the array
  transactions = transactions.filter(transaction => transaction.id !== id);
  
  // Update localStorage
  updateLocalStorage();
  
  // Re-initialize the app
  init();
}

// Update transactions in localStorage
function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Event listeners
form.addEventListener('submit', addTransaction);

// Initialize the app
init();
