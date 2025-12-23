import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJobs, getJobAnalytics, getEvaluation } from '../../api';
import './analytics.css';

function Analytics() {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [jobsLoading, setJobsLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const data = await getMyJobs();
                setJobs(data);
                if (data.length > 0) {
                    setSelectedJobId(data[0].publicFormId);
                }
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            } finally {
                setJobsLoading(false);
            }
        };
        fetchJobs();
    }, []);

    useEffect(() => {
        if (!selectedJobId) return;

        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const data = await getJobAnalytics(selectedJobId);
                setAnalyticsData(data);
            } catch (err) {
                console.error("Failed to fetch analytics:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [selectedJobId]);

    const handleCandidateClick = (candidateId) => {
        navigate(`/results/${candidateId}`);
    };

    if (jobsLoading) {
        return (
            <div className="analytics-loading">
                <div className="spinner-large"></div>
                <p>Loading your jobs...</p>
            </div>
        );
    }

    return (
        <div className="analytics-container">
            {/* Sidebar - Job List */}
            <div className="analytics-sidebar">
                <div className="sidebar-header">
                    <h3>Your Jobs</h3>
                </div>
                <div className="job-list">
                    {jobs.length > 0 ? (
                        jobs.map(job => (
                            <div
                                key={job._id}
                                className={`job-item ${selectedJobId === job.publicFormId ? 'active' : ''}`}
                                onClick={() => setSelectedJobId(job.publicFormId)}
                            >
                                <div className="job-title">{job.jobTitle}</div>
                                <div className="job-id">ID: {job.publicFormId.substring(0, 8)}...</div>
                            </div>
                        ))
                    ) : (
                        <div className="no-jobs">No jobs found.</div>
                    )}
                </div>
            </div>

            {/* Main Content - Tiered Grid */}
            <div className="analytics-content">
                {!selectedJobId ? (
                    <div className="empty-state">Select a job to view analytics</div>
                ) : loading ? (
                    <div className="content-loading">
                        <div className="spinner"></div>
                        <p>Loading candidate data...</p>
                    </div>
                ) : analyticsData ? (
                    <div className="tiers-grid">
                        {/* Tier A Column */}
                        <div className="tier-column tier-a">
                            <div className="tier-header">
                                <div className="tier-badge badge-a">Tier A</div>
                                <span className="count">{analyticsData.tier_a?.length || 0}</span>
                            </div>
                            <div className="candidates-list">
                                {analyticsData.tier_a?.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => handleCandidateClick(candidate.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Tier B Column */}
                        <div className="tier-column tier-b">
                            <div className="tier-header">
                                <div className="tier-badge badge-b">Tier B</div>
                                <span className="count">{analyticsData.tier_b?.length || 0}</span>
                            </div>
                            <div className="candidates-list">
                                {analyticsData.tier_b?.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => handleCandidateClick(candidate.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Tier C Column */}
                        <div className="tier-column tier-c">
                            <div className="tier-header">
                                <div className="tier-badge badge-c">Tier C</div>
                                <span className="count">{analyticsData.tier_c?.length || 0}</span>
                            </div>
                            <div className="candidates-list">
                                {analyticsData.tier_c?.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => handleCandidateClick(candidate.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Pending / Evaluating Column */}
                        <div className="tier-column tier-pending">
                            <div className="tier-header">
                                <div className="tier-badge badge-pending">Evaluating</div>
                                <span className="count">{analyticsData.tier_pending?.length || 0}</span>
                            </div>
                            <div className="candidates-list">
                                {analyticsData.tier_pending?.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => handleCandidateClick(candidate.id)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Tier F Column */}
                        <div className="tier-column tier-f">
                            <div className="tier-header">
                                <div className="tier-badge badge-f">Tier F</div>
                                <span className="count">{analyticsData.tier_f?.length || 0}</span>
                            </div>
                            <div className="candidates-list">
                                {analyticsData.tier_f?.map(candidate => (
                                    <CandidateCard
                                        key={candidate.id}
                                        candidate={candidate}
                                        onClick={() => handleCandidateClick(candidate.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">No data available for this job based on current evaluations.</div>
                )}
            </div>
        </div>
    );
}

const CandidateCard = ({ candidate, onClick }) => {
    return (
        <div className="candidate-card" onClick={onClick}>
            <div className="card-top">
                <div className="candidate-score">{candidate.score !== null ? candidate.score : '--'}</div>
                <div className={`status-dot ${candidate.status}`}></div>
            </div>
            <div className="candidate-name" style={{ fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
                {candidate.name?.trim() || 'Anonymous Candidate'}
            </div>
            <div className="candidate-resume text-truncate" title={candidate.resume_name}>
                {candidate.resume_name}
            </div>
            <div className="candidate-date">
                {new Date(candidate.date).toLocaleDateString()}
            </div>
        </div>
    );
};

export default Analytics;