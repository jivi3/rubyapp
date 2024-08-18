import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Login from "./login.jsx";
import Register from "./Register.jsx";
import { Navigate } from "react-router-dom";

createRoot(document.getElementById("root")).render(
	<StrictMode>
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={<Login />} />
				<Route path="/dashboard" element={<App />} />
				<Route path="/register" element={<Register />} />
			</Routes>
		</BrowserRouter>
	</StrictMode>
);
