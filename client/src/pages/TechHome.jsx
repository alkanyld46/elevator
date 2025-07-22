// src/pages/TechHome.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function TechHome() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [all, setAll] = useState([]);
  const [current, setCurrent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [allRes, curRes] = await Promise.all([
          api.get('/elevators'),            // all elevators
          api.get('/elevators/current')     // maintained this month
        ]);
        setAll(allRes.data || []);
        setCurrent(curRes.data || []);
      } catch (e) {
        setErr('Failed to load elevators');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const unmaintained = useMemo(() => {
    const maintainedIds = new Set(current.map(e => e._id));
    return all.filter(e => !maintainedIds.has(e._id));
  }, [all, current]);

  return (
    <div className="container my-4">
      <h2>Welcome {user.name}</h2>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}

      {!loading && !err && (
        <div className="row">
          <div className="col-md-6 mb-4">
            <h4>All Elevators ({all.length})</h4>
            <ul className="list-group">
              {all.map(el => (
                <li className="list-group-item" key={el._id}>
                  {el.name} <small className="text-muted">@ {el.location}</small>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-md-6 mb-4">
            <h4>Unmaintained This Month ({unmaintained.length})</h4>
            <ul className="list-group">
              {unmaintained.length === 0 && (
                <li className="list-group-item">All caught up ✅</li>
              )}
              {unmaintained.map(el => (
                <li
                  className="list-group-item list-group-item-warning"
                  key={el._id}
                >
                  {el.name} <small className="text-muted">@ {el.location}</small>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-3">Press the button to scan an elevator QR code.</p>
      <button className="btn btn-primary" onClick={() => navigate('/scanner')}>
        Scan QR Code
      </button>
    </div>
  );
}
