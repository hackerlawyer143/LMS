import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCourse(id).then(setCourse).catch(() => setCourse(null));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'student') return;
    setEnrolling(true);
    setError('');
    try {
      const res = await api.enroll(Number(id));
      if (res.requiresPayment && res.courseId) {
        const orderRes = await api.createPaymentOrder(res.courseId);
        if (orderRes.orderId && orderRes.keyId) {
          const options = {
            key: orderRes.keyId,
            amount: orderRes.amount,
            currency: orderRes.currency,
            order_id: orderRes.orderId,
            name: 'LMS',
            description: course?.title || 'Course',
            handler: (response) => {
              api.verifyPayment(response.razorpay_order_id, response.razorpay_payment_id, response.razorpay_signature)
                .then(() => navigate(`/payment/success?txn=${response.razorpay_payment_id}`))
                .catch((e) => setError(e.message));
            },
          };
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = () => {
            const rzp = window.Razorpay && new window.Razorpay(options);
            if (rzp) rzp.open();
          };
          document.body.appendChild(script);
          return;
        }
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (!course) return <div className="container">Loading...</div>;

  const isFree = Number(course.price) === 0;

  return (
    <div className="container">
      <div className="card">
        <h1>{course.title}</h1>
        <p>Instructor: {course.User?.full_name} ({course.User?.email})</p>
        <p>Price: {isFree ? 'Free' : `₹${course.price}`}</p>
        <p>{course.description || 'No description.'}</p>
        {error && <p style={{ color: '#dc2626' }}>{error}</p>}
        {user?.role === 'student' && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? 'Processing...' : isFree ? 'Enroll' : 'Pay & Enroll'}
          </button>
        )}
        {user && (user.role === 'faculty' || user.role === 'admin') && (
          <div style={{ marginTop: '1rem' }}>
            <Link to={`/course/${id}/assignments`} className="btn btn-secondary">Assignments</Link>
            <Link to={`/course/${id}/quizzes`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Quizzes</Link>
            <Link to={`/course/${id}/results`} className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>Results</Link>
          </div>
        )}
      </div>
    </div>
  );
}
