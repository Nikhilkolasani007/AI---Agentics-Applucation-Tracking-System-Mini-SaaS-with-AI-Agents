import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './dashboardhome.css';
import { getDashboardStats, getMyJobs } from '../../api';

function DashboardHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    jobs_posted: 0,
    applications_received: 0,
    applications_selected: 0,
    applications_rejected: 0,
    selected_list: [],
    rejected_list: [],
    job_stats: []
  });
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data...");
        const statsData = await getDashboardStats();
        console.log("Stats received:", statsData);
        if (statsData) {
          setStats(statsData);
        }

        const jobsData = await getMyJobs();
        console.log("Jobs received:", jobsData);
        if (jobsData) {
          setMyJobs(jobsData);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Helper to find stats for a specific job
  const getStatsForJob = (jobId) => {
    if (!stats.job_stats) return { selected: 0, rejected: 0, total: 0 };
    const jobStat = stats.job_stats.find(s => s.job_id === jobId);
    return jobStat || { selected: 0, rejected: 0, total: 0 };
  };

  if (loading && myJobs.length === 0 && stats.applications_received === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', flexDirection: 'column', gap: '20px' }}>
        <div className="spinner-large"></div>
        <p style={{ color: '#64748b', fontWeight: '500' }}>Loading real-time hiring data...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '50px' }}>
      <div className="dashboard-title">Real Time Hiring Data</div>
      <div className="companyinsights">
        <div className="insight-card jobs">
          <p className="label">Jobs Posted</p>
          <p className="value">{myJobs.length}</p>
        </div>
        <div className="insight-card applications">
          <p className="label">Applications Received</p>
          <p className="value">{stats.applications_received}</p>
        </div>
        <div className="insight-card selected">
          <p className="label">Applications Selected</p>
          <p className="value">{stats.applications_selected}</p>
        </div>
        <div className="insight-card rejected">
          <p className="label">Applications Rejected</p>
          <p className="value">{stats.applications_rejected}</p>
        </div>
      </div>

      {/* Jobs Performance Section */}
      <div style={{ padding: '20px', marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Active Jobs & Performance</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          {myJobs.length > 0 ? (
            myJobs.map((job) => {
              const jobStat = getStatsForJob(job._id);
              return (
                <div
                  key={job._id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '15px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ margin: 0, color: '#1f2937' }}>{job.jobTitle}</h3>
                      <p style={{ margin: '5px 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>ID: {job.publicFormId}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={{ padding: '4px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' }}>Active</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '4px', fontWeight: '600' }}>TOTAL</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1e293b' }}>{jobStat.total}</div>
                    </div>
                    <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '4px', fontWeight: '600' }}>SELECTED</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#15803d' }}>{jobStat.selected}</div>
                    </div>
                    <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.75rem', color: '#991b1b', marginBottom: '4px', fontWeight: '600' }}>REJECTED</div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#b91c1c' }}>{jobStat.rejected}</div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>No jobs created yet. Go to Jobs tab to create one.</p>
          )}
        </div>
      </div>

      {/* Recent Selected Applications */}
      <div style={{ padding: '20px', marginTop: '30px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Selected Applications (Tier A/B)</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {stats.selected_list && stats.selected_list.length > 0 ? (
            stats.selected_list.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/results/${app.id}`)}
                style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: '5px solid #28a745',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#28a745' }}>{app.tier}</strong>
                  <span style={{ marginLeft: '15px', color: '#666' }}>Job ID: {app.job_id}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>Score: {app.score}</div>
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>No selected applications yet</p>
          )}
        </div>
      </div>

      {/* Recent Rejected Applications */}
      <div style={{ padding: '20px', marginTop: '20px' }}>
        <h2 style={{ marginBottom: '20px' }}>Recent Rejected Applications (Tier F)</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          {stats.rejected_list && stats.rejected_list.length > 0 ? (
            stats.rejected_list.map((app) => (
              <div
                key={app.id}
                onClick={() => navigate(`/results/${app.id}`)}
                style={{
                  background: 'white',
                  padding: '15px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: '5px solid #dc3545',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.1rem', color: '#dc3545' }}>{app.tier}</strong>
                  <span style={{ marginLeft: '15px', color: '#666' }}>Job ID: {app.job_id}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50' }}>Score: {app.score}</div>
                  <div style={{ fontSize: '0.875rem', color: '#999' }}>
                    {app.date ? new Date(app.date).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p style={{ color: '#999', textAlign: 'center' }}>No rejected applications yet</p>
          )}
        </div>
      </div>

      <br />
      <h2 style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "10px" }}>Real Time Data - Employment | AI Funding | High Tech Manufacturing in GDP</h2>
      <div style={{ width: "100%", height: "600px" }}>

        <iframe
          src="https://ourworldindata.org/grapher/private-investment-in-artificial-intelligence?tab=line"
          loading="lazy"
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="web-share; clipboard-write"
          title="Industry jobs as a share of total employment, 2023"
        />
        <iframe
          src="https://ourworldindata.org/grapher/share-of-global-services-exports?tab=map"
          loading="lazy"
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="web-share; clipboard-write"
          title="Industry jobs as a share of total employment, 2023"
        />
        <iframe
          src="https://ourworldindata.org/grapher/industry-share-of-total-emplyoment?tab=map"
          loading="lazy"
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="web-share; clipboard-write"
          title="External funding for privately held AI companies raising above $1.5 million"
        />
        <iframe
          src="https://ourworldindata.org/grapher/total-manufacturing-value-added-from-high-tech?tab=map"
          loading="lazy"
          style={{ width: "100%", height: "100%", border: "none" }}
          allow="web-share; clipboard-write"
          title="External funding for privately held AI companies raising above $1.5 million"
        />
      </div>
    </div>
  );
}

export default DashboardHome;
