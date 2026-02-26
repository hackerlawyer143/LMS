import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function CourseQuizzes() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', total_marks: 100, duration_mins: 30, questions: [{ question_text: '', options: ['', ''], correct_option_index: 0 }] });
  const isFaculty = user?.role === 'faculty' || user?.role === 'admin';

  useEffect(() => {
    api.getQuizzesByCourse(courseId).then(setQuizzes).catch(() => setQuizzes([])).finally(() => setLoading(false));
  }, [courseId]);

  const addQuestion = () => {
    setForm((f) => ({ ...f, questions: [...f.questions, { question_text: '', options: ['', ''], correct_option_index: 0 }] }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm((f) => {
      const q = [...f.questions];
      q[idx] = { ...q[idx], [field]: value };
      return { ...f, questions: q };
    });
  };

  const addOption = (qIdx) => {
    setForm((f) => {
      const q = [...f.questions];
      q[qIdx] = { ...q[qIdx], options: [...(q[qIdx].options || []), ''] };
      return { ...f, questions: q };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const payload = {
      title: form.title,
      total_marks: form.total_marks,
      duration_mins: form.duration_mins,
      questions: form.questions.map((q) => ({
        question_text: q.question_text,
        options: q.options.filter(Boolean),
        correct_option_index: Number(q.correct_option_index) || 0,
      })).filter((q) => q.question_text && q.options.length >= 2),
    };
    if (payload.questions.length === 0) {
      alert('Add at least one question with 2+ options.');
      return;
    }
    try {
      await api.createQuiz(courseId, payload);
      setShowForm(false);
      setForm({ title: '', total_marks: 100, duration_mins: 30, questions: [{ question_text: '', options: ['', ''], correct_option_index: 0 }] });
      api.getQuizzesByCourse(courseId).then(setQuizzes);
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Quizzes</h1>
      <Link to={`/course/${courseId}`}>Back to course</Link>

      {isFaculty && (
        <>
          <button type="button" className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Create Quiz'}
          </button>
          {showForm && (
            <div className="card" style={{ marginTop: '1rem' }}>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label>Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Total marks</label>
                  <input type="number" min={0} value={form.total_marks} onChange={(e) => setForm({ ...form, total_marks: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Duration (mins)</label>
                  <input type="number" min={1} value={form.duration_mins} onChange={(e) => setForm({ ...form, duration_mins: e.target.value })} />
                </div>
                <h4>Questions</h4>
                {form.questions.map((q, idx) => (
                  <div key={idx} className="card" style={{ marginBottom: '1rem' }}>
                    <input placeholder="Question text" value={q.question_text} onChange={(e) => updateQuestion(idx, 'question_text', e.target.value)} />
                    {q.options.map((opt, oi) => (
                      <div key={oi} style={{ marginTop: '0.5rem' }}>
                        <input placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => {
                          const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(idx, 'options', opts);
                        }} />
                        <label><input type="radio" name={`correct-${idx}`} checked={q.correct_option_index === oi} onChange={() => updateQuestion(idx, 'correct_option_index', oi)} /> Correct</label>
                      </div>
                    ))}
                    <button type="button" className="btn btn-secondary" onClick={() => addOption(idx)}>Add option</button>
                  </div>
                ))}
                <button type="button" className="btn btn-secondary" onClick={addQuestion}>Add question</button>
                <button type="submit" className="btn btn-primary" style={{ marginLeft: '0.5rem' }}>Create Quiz</button>
              </form>
            </div>
          )}
        </>
      )}

      <div style={{ marginTop: '1rem' }}>
        {quizzes.map((q) => (
          <div key={q.id} className="card">
            <h3>{q.title}</h3>
            <p>Marks: {q.total_marks} | Duration: {q.duration_mins} min</p>
            {user?.role === 'student' && (
              <Link to={`/quiz/${q.id}`} className="btn btn-primary">Take Quiz</Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
