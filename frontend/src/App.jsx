// import { useState } from 'react'
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

function App() {
	const data = {
		labels: ["Shopping", "Groceries", "Electronics"],
		datasets: [
			{
				label: "# of transactions",
				data: [12, 19, 3], // Data points
				backgroundColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)"
				],
				borderColor: [
					"rgba(255, 99, 132, 1)",
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)"
				],
				borderWidth: 1
			}
		]
	};

	// Chart options (optional)
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "top" // Position of the legend
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
				backgroundColor: ["#4d4ae1"], // Bar color
				// borderColor: "rgba(75, 192, 192, 1)", // Border color
				borderWidth: 1, // Border width for bars
				borderRadius: 10
			}
		]
	};

	// Chart options (optional)
	const baroptions = {
		responsive: true,
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

	return (
		<>
			<h2>SpendRuby Expense Tracker</h2>
			<div className="dashboard">
				<DashboardSection title="Card Details">
					<div className="card">
						<div className="name">Jivi Irivichetty</div>
						<div className="number">4117 7440 8523 4644</div>
						<div className="additional-details">
							<span className="expiration">4/29</span>
							<span className="cvv">931</span>
						</div>
					</div>
				</DashboardSection>
				<DashboardSection title="Account Details">
					<div className="remaining-balance">
						<h5>Remaining Balance</h5>
						<h2>$6969.69</h2>
						<div className="ask">
							<p>Ask me anything about your transactions</p>
						</div>
					</div>
				</DashboardSection>
				<DashboardSection title="Transaction Summaries">
					<div className="transaction-charts">
						<div className="pie-chart">
							<Pie data={data} options={options} />
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
			</div>
		</>
	);
}

export default App;
