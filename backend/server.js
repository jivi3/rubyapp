const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Example in-memory data
let transactions = [
    { transaction_id: 1, user_id: 1, amount: 150, category: 'Groceries', merchant: 'Costco', date: '2024-08-17' },
    { transaction_id: 2, user_id: 1, amount: 90, category: 'Transport', merchant: 'NJTransit', date: '2024-08-18' }
];

// Fetch all transactions for a specific user
app.get('/users/:userId/transactions', (req, res) => {
    const { userId } = req.params;
    const userTransactions = transactions.filter(t => t.user_id === parseInt(userId));
    res.status(200).json(userTransactions);
});

// Add a new transaction for a user
app.post('/users/:userId/transactions', (req, res) => {
    const { userId } = req.params;
    const { amount, category, merchant, date } = req.body;
    const newTransaction = {
        transaction_id: transactions.length + 1, // Increment ID based on the array length
        user_id: parseInt(userId),
        amount,
        category,
        merchant,
        date
    };
    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
});

// Retrieve details about a specific transaction
app.get('/transactions/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const transaction = transactions.find(t => t.transaction_id === parseInt(transactionId));
    if (transaction) {
        res.status(200).json(transaction);
    } else {
        res.status(404).send('Transaction not found');
    }
});

// Update an existing transaction
app.put('/transactions/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const { amount, category, merchant, date } = req.body;
    let transaction = transactions.find(t => t.transaction_id === parseInt(transactionId));
    if (transaction) {
        transaction.amount = amount;
        transaction.category = category;
        transaction.merchant = merchant;
        transaction.date = date;
        res.status(200).json(transaction);
    } else {
        res.status(404).send('Transaction not found');
    }
});

// Delete a specific transaction
app.delete('/transactions/:transactionId', (req, res) => {
    const { transactionId } = req.params;
    const index = transactions.findIndex(t => t.transaction_id === parseInt(transactionId));
    if (index !== -1) {
        transactions.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).send('Transaction not found');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
