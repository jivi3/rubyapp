require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");
const cors = require("cors");

const OpenAI = require("openai").default;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(
	cors({
		origin: "http://localhost:5173", // Replace with your frontend URL
		methods: ["GET", "POST"], // Add other methods if needed
		allowedHeaders: ["Content-Type", "x-auth-token"] // Add other headers if needed
	})
);

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Middleware for token authentication
const auth = (req, res, next) => {
	const token = req.header("x-auth-token");
	if (!token) {
		return res.status(401).json({ msg: "No token, authorization denied" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded.id;
		next();
	} catch (err) {
		res.status(401).json({ msg: "Token is not valid" });
	}
};

// Test database connection
app.get("/test-db", async (req, res) => {
	try {
		const result = await pool.query("SELECT NOW()");
		res.status(200).json(result.rows[0]);
	} catch (err) {
		console.error("Database query error", err.stack);
		res.status(500).json({ error: "Database connection failed" });
	}
});

// User Registration
app.post("/register", async (req, res) => {
	const { username, email, password } = req.body;
	try {
		const userExists = await pool.query(
			"SELECT * FROM users WHERE email = $1",
			[email]
		);
		if (userExists.rows.length > 0) {
			return res.status(400).json({ msg: "User already exists" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		const newUser = await pool.query(
			"INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING user_id, username, email",
			[username, email, hashedPassword]
		);

		const token = jwt.sign({ id: newUser.rows[0].user_id }, JWT_SECRET, {
			expiresIn: "1h"
		});
		res.status(201).json({ token, user: newUser.rows[0] });
	} catch (err) {
		console.error("Error registering user", err.stack);
		res.status(500).json({ error: "Failed to register user" });
	}
});

// User Login
app.post("/login", async (req, res) => {
	const { email, password } = req.body;
	try {
		const user = await pool.query("SELECT * FROM users WHERE email = $1", [
			email
		]);
		if (user.rows.length === 0) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}

		const isMatch = await bcrypt.compare(password, user.rows[0].password);
		if (!isMatch) {
			return res.status(400).json({ msg: "Invalid credentials" });
		}

		const token = jwt.sign({ id: user.rows[0].user_id }, JWT_SECRET, {
			expiresIn: "1h"
		});
		res.json({ token, user: user.rows[0] });
	} catch (err) {
		console.error("Error logging in", err.stack);
		res.status(500).json({ error: "Failed to log in" });
	}
});

// Fetch all transactions for a specific user
app.get("/users/:userId/transactions", auth, async (req, res) => {
	const { userId } = req.params;
	if (req.user !== parseInt(userId)) {
		return res.status(403).json({ msg: "Access denied" });
	}
	try {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC",
			[userId]
		);
		res.status(200).json(result.rows);
	} catch (err) {
		console.error("Error fetching transactions", err.stack);
		res.status(500).json({ error: "Failed to fetch transactions" });
	}
});

// Add a new transaction for a user
app.post("/users/:userId/transactions", auth, async (req, res) => {
	const { userId } = req.params;
	const { amount, category, merchant, date } = req.body;
	if (req.user !== parseInt(userId)) {
		return res.status(403).json({ msg: "Access denied" });
	}
	try {
		const result = await pool.query(
			"INSERT INTO transactions (user_id, amount, category, merchant, date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
			[userId, amount, category, merchant, date]
		);
		res.status(201).json(result.rows[0]);
	} catch (err) {
		console.error("Error adding transaction", err.stack);
		res.status(500).json({ error: "Failed to add transaction" });
	}
});

// Retrieve details about a specific transaction
app.get("/transactions/:transactionId", auth, async (req, res) => {
	const { transactionId } = req.params;
	try {
		const result = await pool.query(
			"SELECT * FROM transactions WHERE transaction_id = $1 AND user_id = $2",
			[transactionId, req.user]
		);
		if (result.rows.length > 0) {
			res.status(200).json(result.rows[0]);
		} else {
			res.status(404).json({ msg: "Transaction not found" });
		}
	} catch (err) {
		console.error("Error fetching transaction", err.stack);
		res.status(500).json({ error: "Failed to fetch transaction" });
	}
});

// Update an existing transaction
app.put("/transactions/:transactionId", auth, async (req, res) => {
	const { transactionId } = req.params;
	const { amount, category, merchant, date } = req.body;
	try {
		const result = await pool.query(
			"UPDATE transactions SET amount = $1, category = $2, merchant = $3, date = $4 WHERE transaction_id = $5 AND user_id = $6 RETURNING *",
			[amount, category, merchant, date, transactionId, req.user]
		);
		if (result.rows.length > 0) {
			res.status(200).json(result.rows[0]);
		} else {
			res.status(404).json({ msg: "Transaction not found" });
		}
	} catch (err) {
		console.error("Error updating transaction", err.stack);
		res.status(500).json({ error: "Failed to update transaction" });
	}
});

// Delete a specific transaction
app.delete("/transactions/:transactionId", auth, async (req, res) => {
	const { transactionId } = req.params;
	try {
		const result = await pool.query(
			"DELETE FROM transactions WHERE transaction_id = $1 AND user_id = $2 RETURNING *",
			[transactionId, req.user]
		);
		if (result.rows.length > 0) {
			res.status(204).send();
		} else {
			res.status(404).json({ msg: "Transaction not found" });
		}
	} catch (err) {
		console.error("Error deleting transaction", err.stack);
		res.status(500).json({ error: "Failed to delete transaction" });
	}
});

// Retrieve user details
app.get("/users/:userId", auth, async (req, res) => {
	const { userId } = req.params;
	try {
		const user = await pool.query(
			"SELECT username, email FROM users WHERE user_id = $1",
			[userId]
		);
		if (user.rows.length === 0) {
			return res.status(404).json({ msg: "Username not found" });
		}
		res
			.status(200)
			.json({ username: user.rows[0].username, email: user.rows[0].email });
	} catch (err) {
		console.error("Error fetching username", err.stack);
		res.status(500).json({ error: "Failed to fetch username" });
	}
});

// Endpoint to handle queries about expenses
app.post("/users/:userId/query", auth, async (req, res) => {
	const { userId } = req.params;
	const { query } = req.body;

	if (req.user !== parseInt(userId)) {
		return res.status(403).json({ msg: "Access denied" });
	}

	try {
		const transactionsResult = await pool.query(
			"SELECT * FROM transactions WHERE user_id = $1",
			[userId]
		);
		const transactionsData = transactionsResult.rows;

		// Prepare a system prompt about the nature of the assistant
		const systemPrompt = {
			role: "system",
			content:
				"You are a helpful assistant that analyzes financial transactions and provides insights."
		};

		// User's query about their transactions
		const userPrompt = {
			role: "user",
			content: `I have the following transactions: ${JSON.stringify(
				transactionsData
			)}. Based on this data, ${query}. Answer as concisely as possible and avoid showing calculations unless prompted, attempt to stay under 2 sentences. If a number is negative, it represents an expense so consider it as postive and vice versa.`
		};

		// Making the request to OpenAI
		const completion = await openai.chat.completions.create({
			model: "gpt-4o", // Ensure you use the correct model ID that you have access to
			messages: [systemPrompt, userPrompt]
		});

		// Extracting just the content from the answer
		const answerContent = completion.choices[0].message.content; // Accessing the content directly

		res.json({ answer: answerContent }); // Sending only the content as the response
	} catch (err) {
		console.error("Error processing query", err);
		res.status(500).json({ error: "Failed to process query" });
	}
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
