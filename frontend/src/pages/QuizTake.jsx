import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';

export default function QuizTake() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(null);

  useEffect(() => {
    api.getQuiz(id).then(setQuiz).catch(() => setQuiz(null));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.submitQuizAttempt(id, answers);
      setSubmitted(res);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!quiz) return <div className="container">Loading...</div>;
  if (submitted) {
    return (
      <div className="container">
        <div className="card">
          <h1>Quiz Submitted</h1>
          <p>Score: {submitted.score} / {quiz.total_marks}</p>
          <Link to={`/course/${quiz.course_id}/quizzes`} className="btn btn-primary">Back to Quizzes</Link>
        </div>
      </div>
    );
  }

  const questions = quiz.QuizQuestions || quiz.quiz_questions || [];

  return (
    <div className="container">
      <h1>{quiz.title}</h1>
      <form onSubmit={handleSubmit}>
        {questions.map((q) => (
          <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
            <p><strong>{q.question_text}</strong></p>
            {(q.options || []).map((opt, oi) => (
              <label key={oi} style={{ display: 'block', marginTop: '0.5rem' }}>
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={answers[q.id] === oi}
                  onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                />
                {opt}
              </label>
            ))}
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
      <Link to={`/course/${quiz.course_id}/quizzes`} style={{ marginTop: '1rem', display: 'inline-block' }}>Back</Link>
    </div>
  );
}
