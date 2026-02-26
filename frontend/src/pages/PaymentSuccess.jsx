import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const txn = params.get('txn');

  return (
    <div className="container">
      <div className="card">
        <h1>Payment Successful</h1>
        <p>Your enrollment is complete.</p>
        {txn && <p>Transaction ID: {txn}</p>}
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    </div>
  );
}
