import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function CourseAssignments() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '', max_marks: 100 });
  const [submissions, setSubmissions] = useState({});
  const [submissionMarks, setSubmissionMarks] = useState({});
  const [submissionFeedback, setSubmissionFeedback] = useState({});
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  const load = () => {
    api.getAssignmentsByCourse(courseId)
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.createAssignment(courseId, form);
      setForm({ title: '', description: '', deadline: '', max_marks: 100 });
      setShowForm(false);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleSubmitFile = async (assignmentId, file) => {
    if (!file) return;
    try {
      await api.submitAssignment(assignmentId, file);
      load();
    } catch (err) {
      alert(err.message);
    }
  };

  const loadSubmissions = (assignmentId) => {
    api.getAssignmentSubmissions(assignmentId).then((list) => {
      setSubmissions((s) => ({ ...s, [assignmentId]: list }));
      const marks = {};
      const feedback = {};
      list.forEach((sub) => {
        marks[sub.id] = sub.marks;
        feedback[sub.id] = sub.feedback || '';
      });
      setSubmissionMarks((m) => ({ ...m, ...marks }));
      setSubmissionFeedback((f) => ({ ...f, ...feedback }));
    });
  };

  const handleUpdateMarks = async (assignmentId, submissionId, marks, feedback) => {
    try {
      await api.updateSubmissionMarks(assignmentId, submissionId, marks, feedback || '');
      setSubmissionMarks((m) => ({ ...m, [submissionId]: marks }));
      setSubmissionFeedback((f) => ({ ...f, [submissionId]: feedback || '' }));
      loadSubmissions(assignmentId);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Assignments</h1>
      <Link to={`/course/${courseId}`}>Back to course</Link>

      {isFaculty && (
        <>
          <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Assignment'}
          </button>
          {showForm && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Deadline</label>
                  <input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Max marks</label>
                  <input type="number" min={1} value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">Create</button>
              </form>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        {assignments.map((a) => {
          const past = new Date(a.deadline) < new Date();
          return (
            <div key={a.id} className="card">
              <h3>{a.title}</h3>
              <p>{a.description}</p>
              <p>Deadline: {new Date(a.deadline).toLocaleString()} | Max marks: {a.max_marks}</p>
              {user?.role === 'student' && !past && (
                <div>
                  <input
                    type="file"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleSubmitFile(a.id, f); e.target.value = ''; }}
                  />
                </div>
              )}
              {isFaculty && (
                <div>
                  <button type="button" className="btn btn-secondary" onClick={() => loadSubmissions(a.id)}>View submissions</button>
                  {submissions[a.id]?.map((sub) => (
                    <div key={sub.id} style={{ marginTop: '0.5rem', padding: '0.5rem', background: '#f9fafb', borderRadius: 6 }}>
                      <span>{sub.User?.full_name}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Marks"
                        value={submissionMarks[sub.id] ?? sub.marks ?? ''}
                        onChange={(e) => setSubmissionMarks((m) => ({ ...m, [sub.id]: e.target.value === '' ? null : Number(e.target.value) }))}
                        onBlur={(e) => handleUpdateMarks(a.id, sub.id, e.target.value === '' ? submissionMarks[sub.id] ?? sub.marks ?? 0 : Number(e.target.value), submissionFeedback[sub.id] ?? sub.feedback ?? '')}
                        style={{ width: 80, marginLeft: 8 }}
                      />
                      <input
                        placeholder="Feedback"
                        value={submissionFeedback[sub.id] ?? sub.feedback ?? ''}
                        onChange={(e) => setSubmissionFeedback((f) => ({ ...f, [sub.id]: e.target.value }))}
                        onBlur={(e) => handleUpdateMarks(a.id, sub.id, submissionMarks[sub.id] ?? sub.marks ?? 0, e.target.value)}
                        style={{ marginLeft: 8, flex: 1 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
