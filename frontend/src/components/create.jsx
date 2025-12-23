import React, {useState} from "react";
import { useNavigate } from "react-router-dom";
import "./sign.css"
function Create() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [first_name, setFirst_Name] = useState("");
    const [last_name, setLast_Name] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleCreate = async () => {
        if (!first_name || !last_name || !email || !password) {
            setError("All Fields are Required")
            setLoading(false);
            return;
        }

        setLoading(true);
        setError("")

        try {
            const response = await fetch("http://localhost:5000/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type" : "application/json",
                },
                body: JSON.stringify({
                    first_name,
                    last_name,
                    email,
                    password,
                }),
            });

            if (!response.ok) {
                throw new Error("Account Creation Failed");
            }

            const data = await response.json();
            console.log("Sign uP", data);
            navigate("/Signin")
        } catch (err) {
            setError(err.message);
        } finally{
            setLoading(false);
        }
    }
    return(
        <>
        <div className="block">
            <div className="sign">
                <h1>Pramana AI</h1>
                <h2>Create @ccount</h2>

                <input 
                type="text"
                placeholder="First Name"
                value={first_name}
                onChange={(e) => setFirst_Name(e.target.value)}
                required
                />

                <input 
                type="text"
                placeholder="Last Name"
                value={last_name}
                onChange={(e) => setLast_Name(e.target.value)} 
                required
                />

                <input 
                type="email"
                placeholder="Enter Email @ddress"
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required
                />

                <input 
                type="password"
                placeholder="Enter P@$$word" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                />

                <br />
                <button onClick={handleCreate} disabled={loading}>{loading ? "CREATING" : "CREATE"}</button>
                {error && <p style={{color: "red"}}>{error}</p>}
            </div>
        </div>
        </>
    )
}

export default Create;