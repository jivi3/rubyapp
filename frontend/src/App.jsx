import { useState, useEffect, useRef } from "react";
import "./index.css";
import "./App.css";
import { Pie, Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	Title,
	BarElement,
	CategoryScale,
	LinearScale,
	ArcElement,
	Tooltip,
	Legend
} from "chart.js";
import DashboardSection from "./components/DashboardSection";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	ArcElement,
	Tooltip,
	Legend
);

const formatCurrency = (number) => {
	if (number < 0) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(number * -1);
	} else {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(number);
	}
};

const getGreeting = (userName, hour) => {
	if (userName && userName.length <= 30) {
		if (hour > 17) {
			return "Good Evening, " + userName;
		} else if (hour > 11) {
			return "Good Afternoon, " + userName;
		} else return "Good Morning, " + userName;
	} else {
		if (hour > 17) {
			return "Good Evening";
		} else if (hour > 11) {
			return "Good Afternoon";
		} else return "Good Morning";
	}
};

function App() {
	const [transactions, setTransactions] = useState([]);
	const [chartData, setChartData] = useState({
		labels: [],
		datasets: [
			{
				label: "Amount",
				data: [],
				backgroundColor: [],
				borderColor: [],
				borderWidth: 1
			}
		]
	});
	const [inputValue, setInputValue] = useState("");
	const [messages, setMessages] = useState([
		{ text: "Ask me anything about your transactions", type: "response" } // Initial prompt message
	]);
	const [userDetails, setUserDetails] = useState({});

	const promptRef = useRef(null); // Ref to track the .prompt container

	// Function to keep the chat box scrolled to the bottom
	const scrollToBottom = () => {
		const prompt = promptRef.current;
		if (prompt) {
			prompt.scrollTop = prompt.scrollHeight; // Manually set the scroll position
		}
	};

	const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
	const [transactionData, setTransactionData] = useState({
		merchantName: "",
		amount: "",
		category: "",
		date: new Date().toISOString().slice(0, 10) // Auto-populate today's date
	});

	const addTransaction = () => {
		setIsModalOpen(true); // Open the modal when the button is clicked
	};

	const handleCloseModal = () => {
		setIsModalOpen(false); // Close the modal
		setTransactionData({
			merchantName: "",
			amount: "",
			category: "",
			date: new Date().toISOString().slice(0, 10)
		}); // Reset the form fields when closing
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setTransactionData((prevData) => ({
			...prevData,
			[name]: value
		}));
	};

	const handleFormSubmit = async (e) => {
		e.preventDefault();

		const token = localStorage.getItem("token");
		const user_id = localStorage.getItem("user_id");
		try {
			const response = await fetch(
				`http://192.168.1.75:3000/users/${user_id}/transactions`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-auth-token": `${token}`
					},
					body: JSON.stringify({
						merchant: transactionData.merchantName,
						amount: transactionData.amount * -1,
						category: transactionData.category,
						date: transactionData.date
					})
				}
			);

			if (response.ok) {
				const newTransaction = await response.json();
				setTransactions((prevTransactions) => [
					...prevTransactions,
					newTransaction
				]); // Add the new transaction to the state
				handleCloseModal(); // Close the modal on success
			}
		} catch (error) {
			console.error("Error adding transaction:", error);
		}
	};

	useEffect(() => {
		scrollToBottom(); // Scroll to bottom whenever messages change
	}, [messages]);
	const hour = new Date().getHours();

	useEffect(() => {
		const fetchUserDetails = async () => {
			const storedToken = localStorage.getItem("token");
			const storedUserId = localStorage.getItem("user_id");
			const response = await fetch(
				`http://192.168.1.75:3000/users/${storedUserId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"x-auth-token": `${storedToken}`
					}
				}
			);
			const data = await response.json();
			console.log("data", data);
			setUserDetails(data);
		};
		fetchUserDetails();
	}, []);

	const handleSubmit = async (event) => {
		const storedToken = localStorage.getItem("token");
		const storedUserId = localStorage.getItem("user_id");
		event.preventDefault(); // Prevents the form from refreshing the page
		setMessages((prevMessages) => [
			...prevMessages,
			{ text: inputValue, type: "user" }
		]);
		try {
			const response = await fetch(
				`http://192.168.1.75:3000/users/${storedUserId}/query`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"x-auth-token": `${storedToken}`
					},
					body: JSON.stringify({
						query: inputValue // Send the input value in the request body
					})
				}
			);

			const data = await response.json(); // Parse the response as JSON
			setMessages((prevMessages) => [
				...prevMessages,
				{ text: data.answer, type: "response" }
			]);
		} catch (error) {
			console.error("Error:", error); // Handle any errors
		}
		setInputValue("");
	};

	useEffect(() => {
		const fetchTransactions = async () => {
			// Fetch transactions from the backend
			const storedToken = localStorage.getItem("token");
			const storedUserId = localStorage.getItem("user_id");
			const response = await fetch(
				`http://192.168.1.75:3000/users/${storedUserId}/transactions`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"x-auth-token": `${storedToken}`
					}
				}
			);
			const data = await response.json();
			setTransactions(data);
		};
		fetchTransactions();
	}, []);

	useEffect(() => {
		// Process the transactions to group by category
		const categoryTotals = transactions.reduce((acc, transaction) => {
			const { category, amount } = transaction;
			if (!acc[category]) {
				acc[category] = 0;
			}
			acc[category] += parseFloat(amount);
			return acc;
		}, {});

		// Prepare data for the chart
		const labels = Object.keys(categoryTotals);
		const data = Object.values(categoryTotals);

		setChartData({
			labels,
			datasets: [
				{
					label: "Amount",
					data,
					backgroundColor: [
						"rgba(255, 99, 132, 1)",
						"rgba(54, 162, 235, 1)",
						"rgba(255, 206, 86, 1)",
						"rgba(75, 192, 192, 1)",
						"rgba(153, 102, 255, 1)",
						"rgba(255, 159, 64, 1)"
					],
					borderColor: [
						"rgba(255, 99, 132, 1)",
						"rgba(54, 162, 235, 1)",
						"rgba(255, 206, 86, 1)",
						"rgba(75, 192, 192, 1)",
						"rgba(153, 102, 255, 1)",
						"rgba(255, 159, 64, 1)"
					],
					borderWidth: 1
				}
			]
		});
	}, [transactions]);

	// Chart options (optional)
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "bottom" // Position of the legend
			}
		}
	};

	const bardata = {
		labels: [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		], // X-axis labels
		datasets: [
			{
				label: "Spending in 2023", // Label for the dataset
				data: [120, 190, 300, 500, 250, 320, 192, 282, 29, 644, 292, 428], // Data points
				backgroundColor: ["#FC8050"], // Bar color
				borderWidth: 1, // Border width for bars
				borderRadius: 10
			}
		]
	};

	// Chart options (optional)
	const baroptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false,
				position: "top" // Position of the legend
			},
			title: {
				display: false,
				text: "Monthly Sales for 2023" // Title of the chart
			}
		},
		scales: {
			y: {
				beginAtZero: true, // Y-axis starts at 0
				grid: {
					display: false
				}
			},
			x: {
				grid: {
					display: false // This hides the grid lines on the x-axis
				}
			}
		}
	};

	const totalAmount = transactions.reduce((sum, transaction) => {
		return sum + parseFloat(transaction.amount); // Make sure to convert the amount to a number
	}, 0);

	return (
		<>
			{isModalOpen && (
				<div className="modal">
					<div className="modal-content">
						<h2>Add a New Transaction</h2>
						<form onSubmit={handleFormSubmit}>
							<div className="form-group">
								<label>Merchant Name</label>
								<input
									type="text"
									name="merchantName"
									value={transactionData.merchantName}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="form-group">
								<label>Amount</label>
								<input
									type="number"
									name="amount"
									value={transactionData.amount}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="form-group">
								<label>Category</label>
								<input
									type="text"
									name="category"
									value={transactionData.category}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="form-group">
								<label>Date</label>
								<input
									type="date"
									name="date"
									value={transactionData.date}
									onChange={handleInputChange}
									required
								/>
							</div>
							<div className="form-group">
								<button type="submit">Add Transaction </button>
								<button type="button" onClick={handleCloseModal}>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
			<div className="header">
				<div className="left">
					<h3>Ruby</h3>
					<h2>{getGreeting(userDetails.username, hour)}</h2>
				</div>
				<div className="right">
					<a className="add-button" onClick={addTransaction}>
						Add Transaction
					</a>
					<a href="/login">Logout</a>
				</div>
			</div>
			<div className="dashboard">
				<DashboardSection title="Card Details">
					<div className="cards">
						<div className="card">
							<div className="name">DISCOVER</div>
							<div className="number">**** **** **** 4644</div>
							<div className="additional-details">
								<span className="expiration">4/29</span>
								<span className="cvv">931</span>
							</div>
						</div>
						<div className="add-transaction">
							<a onClick={addTransaction}>Add Transaction</a>
						</div>
					</div>

					<div className="summary">
						<div className="balance">
							<h6>Remaining Balance</h6>
							<h2>{transactions && formatCurrency(transactions[0]?.amount)}</h2>
						</div>
						<div className="spent">
							<h6>Spent this Month</h6>
							<h2>{totalAmount && formatCurrency(totalAmount)}</h2>
						</div>
					</div>
				</DashboardSection>
				<DashboardSection title="Ask about your Finances">
					<div className="chat-box">
						<div className="prompt" ref={promptRef}>
							{messages.map((message, index) => (
								<p
									key={index}
									className={`message ${message.type}`} // You can use this class to style user and response messages differently
								>
									{message.text}
								</p>
							))}
						</div>
						<form className="chat-form" onSubmit={handleSubmit}>
							<input
								value={inputValue}
								onChange={(e) => setInputValue(e.target.value)}
								placeholder="Ex. How much did I spent last month on food?"
							></input>
							<button className="submit-button" type="submit">
								Send
							</button>
						</form>
					</div>
				</DashboardSection>
				<DashboardSection title="Transaction Summaries">
					<div className="transaction-charts">
						<div className="pie-chart">
							<Pie className="pie" data={chartData} options={options} />
						</div>
						<div className="bar-chart">
							<Bar className="bar" data={bardata} options={baroptions} />
						</div>
					</div>
				</DashboardSection>
				<DashboardSection title="Transactions">
					<div className="transactions">
						<table>
							<thead>
								<tr>
									<th>Merchant</th>
									<th>Category</th>
									<th>Amount</th>
									<th>Date</th>
								</tr>
							</thead>
							<tbody>
								{transactions &&
									transactions?.map((transaction) => (
										<tr key={transaction.transaction_id}>
											<td>{transaction.merchant}</td>
											<td>{transaction.category}</td>
											<td>{formatCurrency(transaction.amount)}</td>
											<td>{transaction.date.slice(0, 10)}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</DashboardSection>
			</div>
		</>
	);
}

export default App;
