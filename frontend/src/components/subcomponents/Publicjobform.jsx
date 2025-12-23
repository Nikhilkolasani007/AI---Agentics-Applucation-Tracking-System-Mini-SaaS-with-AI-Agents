import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Publicjobform.css';
import { submitCandidate } from '../../api';

function Publicjobform() {
    const { jobid } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedin: '',
        github: '',
        portfolio: ''
    });
    const [resume, setResume] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
  const fetchJob = async () => {
    try {
      const data = await getPublicJob(jobid);
      setJob(data);
    } catch (err) {
      setError(err.message || "Job not found");
    } finally {
      setLoading(false);
    }
  };

  if (jobid) {
    fetchJob();
  }
}, [jobid]);


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setResume(file);
        } else {
            alert('Please upload a PDF file');
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type === 'application/pdf') {
                setResume(file);
            } else {
                alert('Please upload a PDF file');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!resume) {
            setError('Please upload your resume');
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('resume', resume);
            data.append('job_id', jobid);
            data.append('first_name', formData.firstName);
            data.append('last_name', formData.lastName);
            data.append('email', formData.email);
            if (formData.phone) data.append('phone', formData.phone);
            if (formData.linkedin) data.append('linkedin', formData.linkedin);
            if (formData.github) data.append('github', formData.github);
            if (formData.portfolio) data.append('portfolio', formData.portfolio);

            const result = await submitCandidate(data);
            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="public-form-wrapper">
                <div className="public-form-container">
                    <div className="success-view" style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                        <div style={{ width: '80px', height: '80px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                        </div>
                        <h2 style={{ fontSize: '2rem', color: '#1f2937', marginBottom: '10px' }}>Application Submitted!</h2>
                        <p style={{ color: '#6b7280', fontSize: '1.1rem', maxWidth: '400px', margin: '0 auto 30px auto' }}>
                            Thank you for your interest in {job?.jobTitle}. We have received your application and will review it shortly.
                        </p>
                        <button
                            className="btn-primary"
                            onClick={() => {
                                setSuccess(false);
                                setResume(null);
                                setFormData({
                                    firstName: '',
                                    lastName: '',
                                    email: '',
                                    phone: '',
                                    linkedin: '',
                                    github: '',
                                    portfolio: ''
                                });
                            }}
                        >
                            Submit Another Application
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading job details...</p>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="error-container">
                <h2>Job Not Found</h2>
                <p>{error || 'The job you are looking for does not exist.'}</p>
            </div>
        );
    }

    return (
        <div className="public-form-wrapper">
            <div className="public-form-container">
                <div className="form-header">
                    <h1>Apply for {job.jobTitle}</h1>
                    <p className="job-description">{job.description}</p>
                    <p className="form-subtitle">Fill in your details below. Our AI will evaluate your application and get back to you soon.</p>
                </div>

                <form onSubmit={handleSubmit} className="evaluation-form">
                    {/* Personal Details Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Personal Information</h3>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    placeholder="Jane"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-field">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="jane@example.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-field">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 (555) 000-0000"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Resume Upload Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Resume / CV</h3>
                        </div>

                        <div
                            className={`upload-area ${dragActive ? 'drag-active' : ''} ${resume ? 'has-file' : ''}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                id="resume-upload"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                            <label htmlFor="resume-upload" className="upload-label">
                                {resume ? (
                                    <>
                                        <div className="file-icon-check"></div>
                                        <div className="file-name">{resume.name}</div>
                                        <div className="file-size">{(resume.size / 1024).toFixed(2)} KB</div>
                                    </>
                                ) : (
                                    <>
                                        <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <div className="upload-text">Click to upload or drag and drop</div>
                                        <div className="upload-hint">PDF, DOCX, or TXT (Max 5MB)</div>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Online Presence Section */}
                    <div className="form-section">
                        <div className="section-header">
                            <h3>Online Presence</h3>
                        </div>

                        <div className="form-field">
                            <label>LinkedIn Profile</label>
                            <input
                                type="url"
                                name="linkedin"
                                placeholder="https://linkedin.com/in/username"
                                value={formData.linkedin}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-field">
                            <label>GitHub / Code Repository</label>
                            <input
                                type="url"
                                name="github"
                                placeholder="https://github.com/username"
                                value={formData.github}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-field">
                            <label>Portfolio / Personal Website</label>
                            <input
                                type="url"
                                name="portfolio"
                                placeholder="https://yourportfolio.com"
                                value={formData.portfolio}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            {error}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <span className="spinner-small"></span>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                    </div>

                    <div className="form-footer">
                        <p>By submitting this application, you agree to our <a href="#">Data Processing Terms</a></p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Publicjobform;