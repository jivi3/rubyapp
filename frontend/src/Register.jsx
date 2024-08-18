import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (event) => {
        event.preventDefault();
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to register');
            }
            return response.json();
        })
        .then(() => {
            navigate('/login'); // Navigate to login after successful registration
        })
        .catch(error => {
            console.error("Register Error:", error);
            setErrorMessage("Registration failed. Please check your inputs.");
        });
    };

    return (
        <>
        <style>{`
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f7f7f7;
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .container {
              width: 100%;
              max-width: 360px;
              padding: 40px;
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 16px rgba(0,0,0,0.1);
              text-align: center;
            }

            .form {
              display: flex;
              flex-direction: column;
            }

            .input, .button {
              padding: 12px 20px;
              margin-bottom: 10px;
              border: 1px solid #ccc;
              border-radius: 4px;
            }

            .input:focus {
              border-color: #6658f6;
              outline: none;
            }

            .button {
              background-color: #6658f6;
              color: white;
              border: none;
              cursor: pointer;
              font-weight: bold;
              text-transform: uppercase;
              transition: background-color 0.3s ease;
            }

            .button:hover {
              background-color: #5848c2;
            }

            .error {
              color: red;
              margin-top: 10px;
              font-size: 0.9rem;
            }

            .label {
              text-align: left;
              font-weight: normal;
              color: #666;
              margin-bottom: 5px;
            }
        `}</style>
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
                <button type="submit" className="button">Register</button>
            </form>
            {errorMessage && <p className="error">{errorMessage}</p>}
        </div>
        </>
    );
}

export default Register;
