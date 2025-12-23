import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEvaluation } from '../api';
import './EvaluationResult.css';

const EvaluationResult = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const result = await getEvaluation(id);
            setData(result);
            // Keep polling if status is pending
            if (result.status === 'pending') {
                setTimeout(fetchData, 3000); // Poll every 3 seconds
            } else {
                setLoading(false);
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    if (loading && (!data || data.status === 'pending')) {
        return (
            <div className="loading-view">
                <div className="spinner"></div>
                <h2>AI Analysis in Progress...</h2>
                <p style={{ color: '#6b7280' }}>Our AI is currently analyzing the candidate's profile.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="evaluation-container">
                <div style={{ color: '#dc2626', background: '#fee2e2', padding: '15px', borderRadius: '8px' }}>
                    Error: {error}
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { tier, scores, status } = data;

    const handleStatusAction = async (newStatus) => {
        if (window.confirm(`Mark this candidate as ${newStatus.toUpperCase()}?`)) {
            try {
                await fetch(`http://localhost:8000/candidates/${id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                // Optimistic update
                setData({ ...data, status: newStatus });
            } catch (e) { alert('Error updating status'); }
        }
    };

    return (
        <div className="evaluation-container">
            {/* Header */}
            <div className="evaluation-header">
                <div>
                    <h1>Evaluation Results</h1>
                    <div style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '4px' }}>
                        Candidate ID: <span style={{ fontFamily: 'monospace' }}>{id}</span>
                    </div>
                </div>
                <div className="candidate-meta">
                    <span className={`status-badge ${status || 'pending'}`}>
                        {status || 'Pending Review'}
                    </span>
                    <button className="btn-secondary" onClick={() => window.location.reload()}>
                        Refresh
                    </button>
                </div>
            </div>

            <div className="evaluation-grid">
                {/* Left Sidebar - Score Card */}
                <div className="evaluation-sidebar">
                    <div className="tier-card">
                        <div className="tier-label">Assigned Tier</div>
                        <div className={`tier-display ${tier.letter}`}>
                            {tier.code}
                        </div>
                        <div className="overall-score-label">
                            {scores.overallScore}<span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>/100</span> Overall
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div className="evaluation-content">
                    {/* Metrics Grid */}
                    <div className="scores-grid">
                        <div className="metric-card">
                            <div className="metric-title">Content Quality</div>
                            <div className="metric-value">{scores.contentScore}%</div>
                            <div className="metric-bar-bg" style={{ height: '4px', background: '#e5e7eb', marginTop: '8px', borderRadius: '2px' }}>
                                <div style={{ width: `${scores.contentScore}%`, height: '100%', background: '#3b82f6', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-title">Design Quality</div>
                            <div className="metric-value">{scores.designScore}%</div>
                            <div className="metric-bar-bg" style={{ height: '4px', background: '#e5e7eb', marginTop: '8px', borderRadius: '2px' }}>
                                <div style={{ width: `${scores.designScore}%`, height: '100%', background: '#8b5cf6', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                        <div className="metric-card">
                            <div className="metric-title">Project Strength</div>
                            <div className="metric-value">{scores.projectsScore}%</div>
                            <div className="metric-bar-bg" style={{ height: '4px', background: '#e5e7eb', marginTop: '8px', borderRadius: '2px' }}>
                                <div style={{ width: `${scores.projectsScore}%`, height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                    </div>

                    {/* AI Reasoning */}
                    <div className="reasoning-section">
                        <h3 className="section-title">
                            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            AI Analysis
                        </h3>
                        <p className="reasoning-text">{scores.reasoningSummary}</p>
                    </div>

                    {/* Actions */}
                    <div className="actions-section">
                        <h3 className="section-title">Recruitment Actions</h3>
                        <div className="actions-grid">
                            <a
                                href={`mailto:${data.personal_info?.email || ''}?subject=Coding Test Invitation - ${data.personal_info?.firstName || 'Candidate'}&body=Hi ${data.personal_info?.firstName || 'Candidate'},\n\nWe were impressed by your profile...`}
                                className="btn-action btn-primary"
                            >
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                Send Invite
                            </a>

                            <a
                                href={`http://localhost:8000/candidates/${id}/resume`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-action btn-secondary"
                            >
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                View Resume
                            </a>

                            <div style={{ flex: 1 }}></div>

                            <button className="btn-action btn-accept" onClick={() => handleStatusAction('accepted')}>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Accept
                            </button>

                            <button className="btn-action btn-reject" onClick={() => handleStatusAction('rejected')}>
                                <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvaluationResult;
