import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitCandidate } from '../api';

const EvaluationForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        jobId: 'JOB-GENERIC-001', // Default or could be dynamic
        resume: null,
        linkedin: '',
        github: '',
        portfolio: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, resume: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.resume) {
            setError("Please upload a resume (PDF)");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append('resume', formData.resume);
            data.append('job_id', formData.jobId);
            if (formData.linkedin) data.append('linkedin', formData.linkedin);
            if (formData.github) data.append('github', formData.github);
            if (formData.portfolio) data.append('portfolio', formData.portfolio);

            const result = await submitCandidate(data);
            // Redirect to results page with the new candidate ID
            navigate(`/results/${result.candidate_id}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="evaluation-container" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
            <h2>AI Talent Evaluation</h2>
            <p>Upload your resume and links to get an instant AI-scored evaluation.</p>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Resume (PDF)*</label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileChange}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>LinkedIn URL</label>
                    <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/..."
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>GitHub URL</label>
                    <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/..."
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Portfolio URL</label>
                    <input
                        type="url"
                        name="portfolio"
                        value={formData.portfolio}
                        onChange={handleChange}
                        placeholder="https://..."
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '16px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Analyzing...' : 'Submit for Evaluation'}
                </button>
            </form>
        </div>
    );
};

export default EvaluationForm;
