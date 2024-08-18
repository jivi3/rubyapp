const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Dummy database for demonstration
let transactions = [
    { id: 1, user_id: 1, amount: 150, category: 'Groceries', date: '2024-08-17' },
    { id: 2, user_id: 1, amount: 90, category: 'Transport', date: '2024-08-18' }
  ];
  
  // GET request to fetch all transactions
  app.get('/transactions', (req, res) => {
    res.status(200).json(transactions);
  });
  
  // POST request to add a new transaction
  app.post('/transactions', (req, res) => {
    const { user_id, amount, category, date } = req.body;
    const newTransaction = {
      id: transactions.length + 1,
      user_id,
      amount,
      category,
      date
    };
    transactions.push(newTransaction);
    res.status(201).json(newTransaction);
  });
  