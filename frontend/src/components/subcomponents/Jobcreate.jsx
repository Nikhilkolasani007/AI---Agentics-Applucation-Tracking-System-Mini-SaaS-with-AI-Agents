import { use, useState } from 'react';
import './jobcreate.css';
import { useEffect } from 'react';
function Jobcreate() {

  const [jobname, setJobname] = useState("");
  const [description, setDecription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch("http://localhost:5000/api/jobs/my-jobs", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    fetchJobs();
    // Poll every 10 seconds for real-time updates
    const interval = setInterval(fetchJobs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      // Refresh jobs list
      fetchJobs();
      alert("Job deleted successfully");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSignIn = async () => {
    if (!jobname || !description) {
      setError("Job Name and Description are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/jobs/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          jobTitle: jobname,
          description
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create job");
      }

      alert(`Public Link Created:\n${data.publicFormLink}`);

      // Optional: reset form
      setJobname("");
      setDecription("");

      // Refresh jobs list
      fetchJobs();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <div className="headblock">
        <div className="form">
          <h3>Create Job</h3>
          <input
            className='Jobname'
            type="text"
            placeholder="Job Title"
            value={jobname}
            onChange={(e) => setJobname(e.target.value)} />
          <br />
          <input
            className='description'
            type="text"
            placeholder="Write a Job Decscription"
            value={description}
            onChange={(e) => setDecription(e.target.value)} />
          <br />
          <button onClick={handleSignIn} disabled={loading}>
            {loading ? "Creating Job" : "Create Job"}
          </button>
          <br />
          <br />
          {error && <p style={{ color: "red", marginLeft: "130px" }}>{error}</p>}
        </div>
      </div>

      <div className="jobslist" style={{ marginTop: '40px', padding: '0 20px', overflowY: 'scroll' }}>
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Created Jobs</h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '25px',
          paddingBottom: '40px'
        }}>
          {jobs.map((job) => (
            <div key={job._id} style={{
              background: 'white',
              padding: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
              borderLeft: '6px solid #007bff',
              display: 'flex',
              flexDirection: 'column',
              height: '450px', // Fixed height for uniformity
              transition: 'transform 0.2s ease-in-out',
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '1.1rem',
                fontWeight: '700',
                color: '#1a202c',
                minHeight: '3.5em', // Space for ~2 lines of title
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {job.jobTitle}
              </h4>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                marginBottom: '15px',
                paddingRight: '5px'
              }} className="custom-scrollbar">
                <p style={{
                  color: '#4a5568',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  margin: 0
                }}>
                  {job.description}
                </p>
              </div>

              <div style={{
                background: '#f7fafc',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                border: '1px solid #e2e8f0',
                marginBottom: '15px'
              }}>
                <div style={{ color: '#718096', marginBottom: '4px' }}>Public ID</div>
                <div style={{ fontWeight: '600', color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {job.publicFormId}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/jobs/${job.publicFormId}`;
                    navigator.clipboard.writeText(link);
                    alert("Link copied: " + link);
                  }}
                  style={{
                    padding: '10px 16px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    flex: 1,
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                >
                  Copy Public Link
                </button>
                <button
                  onClick={() => handleDelete(job._id)}
                  style={{
                    padding: '10px 16px',
                    background: '#fff',
                    color: '#dc3545',
                    border: '1px solid #dc3545',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#dc3545'; e.currentTarget.style.color = '#fff'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#dc3545'; }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && <p style={{ textAlign: 'center', color: '#666' }}>No jobs created yet.</p>}
      </div>
    </>
  )
}

export default Jobcreate;