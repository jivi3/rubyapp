import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
function Register() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const handleRegister = async (event) => {
		event.preventDefault();
		fetch("http://localhost:3000/register", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ username, email, password })
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to register");
				}
				return response.json();
			})
			.then(() => {
				navigate("/login"); // Navigate to login after successful registration
			})
			.catch((error) => {
				console.error("Register Error:", error);
				setErrorMessage("Registration failed. Please check your inputs.");
			});
	};

	return (
		<>
			<div className="container">
				<h2>Register</h2>
				<form onSubmit={handleRegister} className="form">
					<label htmlFor="username">Username:</label>
					<input
						type="text"
						id="username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
						className="input"
					/>
					<label htmlFor="email">Email:</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="input"
					/>
					<label htmlFor="password">Password:</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="input"
					/>
					<button type="submit" className="button">
						Register
					</button>
				</form>
				{errorMessage && <p className="error">{errorMessage}</p>}
			</div>
		</>
	);
}

export default Register;
