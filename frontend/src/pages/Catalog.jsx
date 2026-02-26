import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../services/api';

export default function Catalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [freeOnly, setFreeOnly] = useState(false);

  useEffect(() => {
    api.getCourses({ search: search || undefined, freeOnly: freeOnly ? 'true' : undefined })
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, [search, freeOnly]);

  return (
    <div className="container">
      <h1>Course Catalog</h1>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="search"
          placeholder="Search courses"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 300 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" checked={freeOnly} onChange={(e) => setFreeOnly(e.target.checked)} />
          Free only
        </label>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {courses.map((c) => (
            <div key={c.id} className="card">
              <h3>{c.title}</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {c.User?.full_name && `Instructor: ${c.User.full_name}`}
              </p>
              <p>
                Price: {Number(c.price) === 0 ? 'Free' : `₹${c.price}`}
              </p>
              <Link to={`/course/${c.id}`} className="btn btn-primary">View</Link>
            </div>
          ))}
        </div>
      )}
      {!loading && courses.length === 0 && <p>No courses found.</p>}
    </div>
  );
}
