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
  Legend,
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
  const [transactions, setTransactions] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const response = await fetch("http://localhost:3000/users/2/transactions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "your_jwt_token_here",
      },
    });
    const data = await response.json();
    setTransactions(data);
  };

  const data = {
    labels: ["Shopping", "Groceries", "Electronics"],
    datasets: [
      {
        label: "# of transactions",
        data: [12, 19, 3], // Data points
        backgroundColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options (optional)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top", // Position of the legend
      },
    },
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
      "December",
    ], // X-axis labels
    datasets: [
      {
        label: "Spending in 2023", // Label for the dataset
        data: [120, 190, 300, 500, 250, 320, 192, 282, 29, 644, 292, 428], // Data points
        backgroundColor: ["#4f646f"], // Bar color
        // borderColor: "rgba(75, 192, 192, 1)", // Border color
        borderWidth: 1, // Border width for bars
        borderRadius: 10,
      },
    ],
  };

  // Chart options (optional)
  const baroptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        position: "top", // Position of the legend
      },
      title: {
        display: false,
        text: "Monthly Sales for 2023", // Title of the chart
      },
    },
    scales: {
      y: {
        beginAtZero: true, // Y-axis starts at 0
        grid: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false, // This hides the grid lines on the x-axis
        },
      },
    },
  };

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  const submitQuery = async () => {
    const data = await fetch("http://localhost:3000/users/2/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiaWF0IjoxNzIzOTczMDIzLCJleHAiOjE3MjM5NzY2MjN9.nlS5nGqM4MLdANbbTiCfrmGaf6CwDbMweNcUBvjlBbQ",
      },
      body: JSON.stringify({ query }),
    });
    const jsonData = await data.json();
    setResponse(jsonData.answer);
  };

  console.log("res", response);

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
              <h2>$69.69</h2>
            </div>
          </div>
        </DashboardSection>
        <DashboardSection title="Ask about your Finances">
          <div className="chat-box">
            <div className="prompt">
              <p>Ask me anything about your transactions</p>
            </div>
            <input
              value={query}
              onChange={handleQueryChange}
              placeholder="Ex. How much did I spend last month on food?"
            />
            <button onClick={submitQuery}>Submit</button>
            <div>
              <p>{response}</p>
            </div>
          </div>
        </DashboardSection>
        <DashboardSection title="Transaction Summaries">
          <div className="transaction-charts">
            <div className="pie-chart">
              <Pie className="pie" data={data} options={options} />
            </div>
            <div className="bar-chart">
              <Bar className="bar" data={bardata} options={baroptions} />
            </div>
          </div>
        </DashboardSection>
      </div>
    </>
  );
}

export default App;
