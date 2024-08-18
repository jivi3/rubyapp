import { useState, useEffect } from "react";
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
// import { useState } from "react";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	ArcElement,
	Tooltip,
	Legend
);

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

	useEffect(() => {
		const fetchTransactions = async () => {
			// Fetch transactions from the backend
			const response = await fetch(
				"http://192.168.1.75:3000/users/3/transactions",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"x-auth-token":
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzIzOTcxODE0LCJleHAiOjE3MjM5NzU0MTR9.8q9qq5IehUHhjU5snhH4rk8enu-9xcbvUeJAximz8-I"
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
				backgroundColor: ["#4f646f"], // Bar color
				// borderColor: "rgba(75, 192, 192, 1)", // Border color
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
			<div className="header">
				<h3>Ruby</h3>
				<h2>Good Evening, Jivi</h2>
			</div>
			<div className="dashboard">
				<DashboardSection title="Card Details">
					<div className="card">
						<div className="name">DISCOVER</div>
						<div className="number">**** **** **** 4644</div>
						<div className="additional-details">
							<span className="expiration">4/29</span>
							<span className="cvv">931</span>
						</div>
					</div>
					<div className="summary">
						<div className="balance">
							<h6>Remaining Balance</h6>
							<h2>{transactions && transactions[0]?.amount}</h2>
						</div>
						<div className="spent">
							<h6>Spent this Month</h6>
							<h2>{totalAmount && totalAmount}</h2>
						</div>
					</div>
				</DashboardSection>
				<DashboardSection title="Ask about your Finances">
					<div className="chat-box">
						<div className="prompt">
							<p>Ask me anything about your transactions</p>
						</div>
						{/* <div className="chat-input"> */}
						<input placeholder="Ex. How much did I spent last month on food?"></input>
						{/* </div> */}
					</div>
				</DashboardSection>
				<DashboardSection title="Transaction Summaries">
					<div className="transaction-charts">
						<div className="pie-chart">
							<Pie className="pie" data={chartData} options={options} />
						</div>
						<div className="bar-chart">
							<Bar
								className="bar"
								data={bardata}
								options={baroptions}
								// style={{ minWidth:  }}
							/>
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
											<td>{transaction.amount}</td>
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
