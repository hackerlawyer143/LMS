import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../services/api';

export default function CourseResults() {
  const { courseId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCourseResults(courseId).then(setData).catch(() => setData(null)).finally(() => setLoading(false));
  }, [courseId]);

  if (loading) return <div className="container">Loading...</div>;

  const isStudent = data?.assignments && Array.isArray(data.assignments);
  const assignments = isStudent ? data.assignments : data?.assignments || [];
  const quizzes = isStudent ? data.quizzes : data?.quizzes || [];

  return (
    <div className="container">
      <h1>Results</h1>
      <Link to={`/course/${courseId}`}>Back to course</Link>

      <h2>Assignments</h2>
      {isStudent ? (
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>{a.title}: {a.submission ? `${a.submission.marks}/${a.max_marks}` : 'Not submitted'} {a.submission?.feedback && ` - ${a.submission.feedback}`}</li>
          ))}
        </ul>
      ) : (
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>
              {a.title}
              <ul>
                {(a.AssignmentSubmissions || []).map((s) => (
                  <li key={s.id}>{s.User?.full_name}: {s.marks != null ? s.marks : '-'} {s.feedback && ` - ${s.feedback}`}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}

      <h2>Quizzes</h2>
      {isStudent ? (
        <ul>
          {quizzes.map((q) => (
            <li key={q.id}>{q.title}: {q.attempt ? `${q.attempt.score}/${q.total_marks}` : 'Not attempted'}</li>
          ))}
        </ul>
      ) : (
        <ul>
          {quizzes.map((q) => (
            <li key={q.id}>
              {q.title}
              <ul>
                {(q.QuizAttempts || []).map((at) => (
                  <li key={at.id}>{at.User?.full_name}: {at.score}/{q.total_marks}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
