import './dashboard.css';
import { useState } from "react";
import DashboardHome from './subcomponents/DashboardHome';
import Candidates from './subcomponents/Candidates';
import Analytics from './subcomponents/Analytics';
import Settings from './subcomponents/settings';
import Jobcreate from './subcomponents/Jobcreate';
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const navigate = useNavigate();

    // Fetch user from localStorage
    const storedUser = localStorage.getItem("user");
    let user = null;
    try {
        user = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
        console.error("Failed to parse user from localStorage", e);
    }

    // Format name as First Name + Last Name
    const userName = (user && (user.first_name || user.last_name))
        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
        : (user && user.email) ? user.email.split('@')[0] : "Profile";

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/Signin");
    };

    const renderContent = () => {
        switch (activeTab) {
            case "dashboard":
                return <DashboardHome />;
            case "candidates":
                return <Candidates />;
            case "analytics":
                return <Analytics />;
            case "jobcreate":
                return <Jobcreate />;
            case "settings":
                return <Settings />
            default:
                return <DashboardHome />;
        }
    };
    return (
        <>
            <header className="top-nav">
                <div className="logo" onClick={() => setActiveTab("dashboard")}>Pramana AI</div>
                <nav className="nav-links">
                    <button
                        onClick={() => setActiveTab("dashboard")}
                        style={{ borderBottom: activeTab === 'dashboard' ? '2px solid white' : 'none' }}
                    >
                        Dashboard
                    </button>

                    <button
                        onClick={() => setActiveTab("candidates")}
                        style={{ borderBottom: activeTab === 'candidates' ? '2px solid white' : 'none' }}
                    >
                        Candidates
                    </button>

                    <button
                        onClick={() => setActiveTab("analytics")}
                        style={{ borderBottom: activeTab === 'analytics' ? '2px solid white' : 'none' }}
                    >
                        Analytics
                    </button>

                    <button
                        onClick={() => setActiveTab("jobcreate")}
                        style={{ borderBottom: activeTab === 'jobcreate' ? '2px solid white' : 'none' }}
                    >
                        Job Create
                    </button>

                    <button
                        onClick={() => setActiveTab("settings")}
                        style={{ borderBottom: activeTab === 'settings' ? '2px solid white' : 'none' }}
                    >
                        Settings
                    </button>
                </nav>
                <div className="user-profile">
                    <span>{userName}</span>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <main className='dashboard-content'>
                {renderContent()}
            </main>
        </>
    )
}

export default Dashboard;