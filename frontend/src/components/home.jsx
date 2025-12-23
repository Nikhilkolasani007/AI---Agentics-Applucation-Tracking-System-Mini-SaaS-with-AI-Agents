import { useNavigate } from 'react-router-dom';
import './home.css'
function Home() {
    const Navigate = useNavigate();
    return(
    <>
    <div className="home">
        <h1 className="tittle">
            Pramana AI
        </h1>
        <h3>
            Intelligent Talent Evaluation System
        </h3>
        <h3>Open Source</h3>
        <h3>Enterprise "SaaS"</h3>
        <div className="btn">
            <button className="homebtn" onClick={() => {
                Navigate("/Signin")
            }}>
                Login
            </button>
            <br />
            <button className="homebtn" onClick={() => {
                Navigate("/Create")
            }}>
                Sign-Up
             </button>
        </div>

    </div>

    </>
    );
}

export default Home;