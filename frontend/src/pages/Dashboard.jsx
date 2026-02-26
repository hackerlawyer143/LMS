import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: 0 });

  useEffect(() => {
    if (user?.role === 'student') {
      api.getMyEnrollments().then(setEnrollments).catch(() => setEnrollments([]));
    }
    if (user?.role === 'faculty' || user?.role === 'admin') {
      api.getCourses().then(setCourses).catch(() => setCourses([]));
    }
  }, [user?.role]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await api.createCourse(courseForm);
      setCourseForm({ title: '', description: '', price: 0 });
      setShowCourseForm(false);
      api.getCourses().then(setCourses);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <p>Welcome, {user?.full_name} ({user?.role})</p>

      {user?.role === 'student' && (
        <section>
          <h2>My Courses</h2>
          {enrollments.length === 0 ? (
            <p>You are not enrolled in any course. <Link to="/">Browse catalog</Link></p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
              {enrollments.map((e) => (
                <div key={e.id} className="card">
                  <h3>{e.Course?.title}</h3>
                  <Link to={`/course/${e.Course?.id}/assignments`} className="btn btn-secondary">Assignments</Link>
                  <Link to={`/course/${e.Course?.id}/quizzes`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Quizzes</Link>
                  <Link to={`/course/${e.Course?.id}/results`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Results</Link>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {(user?.role === 'faculty' || user?.role === 'admin') && (
        <section>
          <h2>Courses</h2>
          <button type="button" className="btn btn-primary" onClick={() => setShowCourseForm(!showCourseForm)}>
            {showCourseForm ? 'Cancel' : 'Create Course'}
          </button>
          {showCourseForm && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <form onSubmit={handleCreateCourse}>
                <div className="form-group">
                  <label>Title</label>
                  <input value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" min={0} step={0.01} value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">Create</button>
              </form>
            </div>
          )}
          <Link to="/" style={{ display: 'block', marginTop: '0.5rem' }}>View all in catalog</Link>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
            {courses.map((c) => (
              <div key={c.id} className="card">
                <h3>{c.title}</h3>
                <p>Price: {Number(c.price) === 0 ? 'Free' : `₹${c.price}`}</p>
                <Link to={`/course/${c.id}/assignments`} className="btn btn-secondary">Assignments</Link>
                <Link to={`/course/${c.id}/quizzes`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Quizzes</Link>
                <Link to={`/course/${c.id}/results`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Results</Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
