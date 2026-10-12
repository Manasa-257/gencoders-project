import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const recentSessions = [
    {
      scenario: "Delayed Order",
      mode: "Simulator",
      score: "92%",
      status: "Completed",
    },
    {
      scenario: "Refund Request",
      mode: "Manual",
      score: "84%",
      status: "Completed",
    },
    {
      scenario: "Payment Issue",
      mode: "Simulator",
      score: "76%",
      status: "Completed",
    },
    {
      scenario: "Account Login",
      mode: "Replay",
      score: "89%",
      status: "Completed",
    },
  ];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>SupportAI</h1>
          <p>Customer Support Coach</p>
        </div>

        <nav>
          <button onClick={() => navigate("/")}>Dashboard</button>
          <button onClick={() => navigate("/analytics")}>
            Analytics
          </button>
        </nav>
      </header>

      <main className="dashboard-content">
        <section className="hero-section">
          <h2>Welcome to SupportAI</h2>

          <p>
            Improve your customer support conversations with real-time AI
            coaching, knowledge recommendations, and escalation monitoring.
          </p>

          <button
            className="primary-button"
            onClick={() => navigate("/session/new")}
          >
            + Start New Session
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <h3>Total Sessions</h3>
            <strong>24</strong>
            <p>Sessions completed</p>
          </div>

          <div className="stat-card">
            <h3>Average Score</h3>
            <strong>87%</strong>
            <p>Overall coaching score</p>
          </div>

          <div className="stat-card">
            <h3>Escalations</h3>
            <strong>3</strong>
            <p>High-risk conversations</p>
          </div>

          <div className="stat-card">
            <h3>Improvement</h3>
            <strong>+12%</strong>
            <p>Compared with previous sessions</p>
          </div>
        </section>

        <section className="recent-section">
          <div className="section-header">
            <div>
              <h2>Recent Sessions</h2>
              <p>Review your latest customer support sessions.</p>
            </div>

            <button onClick={() => navigate("/analytics")}>
              View Analytics
            </button>
          </div>

          <div className="session-table">
            <div className="table-header">
              <span>Scenario</span>
              <span>Mode</span>
              <span>Score</span>
              <span>Status</span>
            </div>

            {recentSessions.map((session, index) => (
              <div className="table-row" key={index}>
                <span>{session.scenario}</span>
                <span>{session.mode}</span>
                <span>{session.score}</span>
                <span>{session.status}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Dashboard;