import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './candidates.css';
import { getCandidatesList, updateCandidateStatus } from '../../api';

function Candidates() {
    const [candidates, setCandidates] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCandidates = async () => {
            const data = await getCandidatesList();
            setCandidates(data);
        };
        fetchCandidates();
    }, []);

    const handleStatusUpdate = async (candidateId, newStatus) => {
        try {
            await updateCandidateStatus(candidateId, newStatus);
            // Optimistically update the UI
            setCandidates(candidates.map(candidate =>
                candidate.candidate_id === candidateId
                    ? { ...candidate, status: newStatus }
                    : candidate
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <div className="titles">
                <h1>Candidates List</h1>
            </div>

            <div className="candidates-grid" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div className="names header-row" style={{ fontWeight: 'bold', background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                    <p style={{ flex: 1 }}>Last Update</p>
                    <p style={{ flex: 1 }}>Name</p>
                    <p style={{ flex: 1 }}>Job ID</p>
                    <p style={{ flex: 1 }}>Overall Score</p>
                    <p style={{ flex: 1 }}>Tier</p>
                    <p style={{ flex: 1 }}>Status</p>
                    <p style={{ flex: 2 }}>Actions / Links</p>
                </div>

                {candidates.map((cand) => (
                    <div key={cand.candidate_id} className="names candidate-row" style={{ background: '#fff', padding: '10px', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ flex: 1 }}>{new Date(cand.created_at).toLocaleDateString()}</p>
                        <p style={{ flex: 1, fontWeight: 'bold', color: '#1f2937' }}>{cand.name || 'Unknown'}</p>
                        <p style={{ flex: 1 }}>{cand.job_title || cand.job_id}</p>
                        <p style={{ flex: 1 }}>{cand.scores?.overallScore || 'N/A'}</p>
                        <p style={{ flex: 1 }}>
                            <span style={{
                                fontWeight: 'bold',
                                color: cand.tier?.letter === 'A' ? 'green' : cand.tier?.letter === 'B' ? 'orange' : 'red'
                            }}>
                                {cand.tier?.code || 'Pending'}
                            </span>
                        </p>
                        <p style={{ flex: 1 }}>
                            <span className={`status-badge ${cand.status || 'pending'}`}>
                                {cand.status || 'pending'}
                            </span>
                        </p>
                        <div style={{ flex: 2, display: 'flex', gap: '10px', fontSize: '14px', alignItems: 'center' }}>
                            <div className="action-buttons" style={{ display: 'flex', gap: '5px', marginRight: '10px' }}>
                                <button
                                    className="btn-accept"
                                    onClick={() => handleStatusUpdate(cand.candidate_id, 'accepted')}
                                    title="Accept Candidate"
                                    style={{ background: '#dcfce7', color: '#166534', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn-reject"
                                    onClick={() => handleStatusUpdate(cand.candidate_id, 'rejected')}
                                    title="Reject Candidate"
                                    style={{ background: '#fee2e2', color: '#991b1b', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                                >
                                    Reject
                                </button>
                            </div>
                            <button onClick={() => navigate(`/results/${cand.candidate_id}`)} style={{ cursor: 'pointer', padding: '5px 10px' }}>View Report</button>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                                {cand.links?.linkedin && <a href={cand.links.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
                                {cand.links?.github && <a href={cand.links.github} target="_blank" rel="noreferrer">GitHub</a>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Candidates;