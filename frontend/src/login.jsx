import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (event) => {
		event.preventDefault();
		fetch("http://ruby-app-env.eba-xce9i9zm.us-east-1.elasticbeanstalk.com/login", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ email, password })
		})
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to login");
				}
				return response.json();
			})
			.then((data) => {
				localStorage.setItem("token", data.token);
				localStorage.setItem("user_id", data.user.user_id); // Save user_id to localStorage
				navigate("/dashboard");
			})
			.catch((error) => {
				console.error("Login Error:", error);
				setErrorMessage("Login failed. Please check your credentials.");
			});
	};

	return (
		<>
			<div className="container">
				<h2>Login</h2>
				<form onSubmit={handleLogin} className="form">
					<label htmlFor="email" className="label">
						Email:
					</label>
					<input
						type="email"
						id="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="input"
					/>
					<label htmlFor="password" className="label">
						Password:
					</label>
					<input
						type="password"
						id="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						className="input"
					/>
					<button type="submit" className="button">
						Login
					</button>
				</form>
				<button
					type="button"
					className="button"
					onClick={() => navigate("/register")}
				>
					Register
				</button>

				{errorMessage && <p className="error">{errorMessage}</p>}
			</div>
		</>
	);
}

export default Login;
