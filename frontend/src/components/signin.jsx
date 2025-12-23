import React, { useState } from "react";
import "./sign.css"
import { useNavigate } from "react-router-dom";

function SignIn() {
    // State Decleration
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    // LOGIN HANDLER
    const handleSignIn = async () => {
        // Validator
        if (!email || !password) {
            setError("Email and Password Are Required");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error("Invalid Credentials");
            }

            // Sucess Response

            const data = await response.json();
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            console.log("Data: ", data);
            navigate("/dashboard")
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }

    }
    return (
        <>
            <div className="block">
                <div className="sign">
                    <h1>Pramana AI</h1>
                    <h2>Sign In</h2>

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <br />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <br />
                    <button onClick={handleSignIn} disabled={loading}>
                        {loading ? "Signing In" : "Sign In"}
                    </button>

                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
            </div>

        </>
    )
}

export default SignIn;