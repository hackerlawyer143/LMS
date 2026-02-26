const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

function headers(includeAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (includeAuth) {
    const t = getToken();
    if (t) h.Authorization = `Bearer ${t}`;
  }
  return h;
}

export async function register(data) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || out.errors?.[0]?.msg || 'Registration failed');
  return out;
}

export async function login(data) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: headers(false),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Login failed');
  return out;
}

export async function me() {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Not authenticated');
  return out;
}

export async function getCourses(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/courses${q ? `?${q}` : ''}`);
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch courses');
  return out;
}

export async function getCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch course');
  return out;
}

export async function createCourse(data) {
  const res = await fetch(`${API_BASE}/courses`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || out.errors?.[0]?.msg || 'Failed to create course');
  return out;
}

export async function updateCourse(id, data) {
  const res = await fetch(`${API_BASE}/courses/${id}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to update course');
  return out;
}

export async function deleteCourse(id) {
  const res = await fetch(`${API_BASE}/courses/${id}`, { method: 'DELETE', headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to delete course');
  return out;
}

export async function getMyEnrollments() {
  const res = await fetch(`${API_BASE}/enrollments/my`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch enrollments');
  return out;
}

export async function enroll(courseId) {
  const res = await fetch(`${API_BASE}/enrollments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ courseId }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Enrollment failed');
  return out;
}

export async function createPaymentOrder(courseId) {
  const res = await fetch(`${API_BASE}/payments/create-order`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ courseId }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to create order');
  return out;
}

export async function verifyPayment(orderId, paymentId, signature) {
  const res = await fetch(`${API_BASE}/payments/verify`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ orderId, paymentId, signature }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Verification failed');
  return out;
}

export async function getTransactions() {
  const res = await fetch(`${API_BASE}/transactions`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch transactions');
  return out;
}

export async function getAssignmentsByCourse(courseId) {
  const res = await fetch(`${API_BASE}/assignments/courses/${courseId}/assignments`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch assignments');
  return out;
}

export async function createAssignment(courseId, data) {
  const res = await fetch(`${API_BASE}/assignments/courses/${courseId}/assignments`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to create assignment');
  return out;
}

export async function submitAssignment(assignmentId, file) {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Submit failed');
  return out;
}

export async function getAssignmentSubmissions(assignmentId) {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch submissions');
  return out;
}

export async function updateSubmissionMarks(assignmentId, submissionId, marks, feedback) {
  const res = await fetch(`${API_BASE}/assignments/${assignmentId}/submissions/${submissionId}/marks`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ marks, feedback }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to update marks');
  return out;
}

export async function getQuizzesByCourse(courseId) {
  const res = await fetch(`${API_BASE}/quizzes/courses/${courseId}/quizzes`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch quizzes');
  return out;
}

export async function getQuiz(id) {
  const res = await fetch(`${API_BASE}/quizzes/${id}`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch quiz');
  return out;
}

export async function createQuiz(courseId, data) {
  const res = await fetch(`${API_BASE}/quizzes/courses/${courseId}/quizzes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to create quiz');
  return out;
}

export async function submitQuizAttempt(quizId, answers) {
  const res = await fetch(`${API_BASE}/quizzes/${quizId}/attempt`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ answers }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Attempt failed');
  return out;
}

export async function getCourseResults(courseId) {
  const res = await fetch(`${API_BASE}/results/courses/${courseId}/results`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch results');
  return out;
}

export async function getUsers(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/users${q ? `?${q}` : ''}`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch users');
  return out;
}

export async function createUser(data) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(data),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to create user');
  return out;
}

export async function updateUserStatus(id, status) {
  const res = await fetch(`${API_BASE}/users/${id}/status`, {
    method: 'PATCH',
    headers: headers(),
    body: JSON.stringify({ status }),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to update status');
  return out;
}

export async function getAdminRevenue() {
  const res = await fetch(`${API_BASE}/admin/reports/revenue`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch revenue');
  return out;
}

export async function getAdminPayments(params = {}) {
  const q = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/admin/reports/payments${q ? `?${q}` : ''}`, { headers: headers() });
  const out = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(out.error || 'Failed to fetch payments');
  return out;
}
