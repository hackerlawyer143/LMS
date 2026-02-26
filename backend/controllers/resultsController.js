const { Assignment, AssignmentSubmission, Quiz, QuizAttempt, Course, Enrollment, User } = require('../models');
const { Op } = require('sequelize');

exports.getByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const isInstructor = course.instructor_id === req.userId;
    const isAdmin = req.userRole === 'admin';
    const isEnrolled = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: courseId },
    });
    if (!isInstructor && !isAdmin && !isEnrolled) {
      return res.status(403).json({ error: 'Not enrolled' });
    }

    if (req.userRole === 'student') {
      const assignments = await Assignment.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: AssignmentSubmission,
            where: { user_id: req.userId },
            required: false,
            as: 'AssignmentSubmissions',
          },
        ],
      });
      const quizzes = await Quiz.findAll({
        where: { course_id: courseId },
        include: [
          {
            model: QuizAttempt,
            where: { user_id: req.userId },
            required: false,
            as: 'QuizAttempts',
          },
        ],
      });
      const results = {
        assignments: assignments.map((a) => ({
          id: a.id,
          title: a.title,
          max_marks: a.max_marks,
          submission: a.AssignmentSubmissions?.[0]
            ? { marks: a.AssignmentSubmissions[0].marks, feedback: a.AssignmentSubmissions[0].feedback }
            : null,
        })),
        quizzes: quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          total_marks: q.total_marks,
          attempt: q.QuizAttempts?.[0] ? { score: q.QuizAttempts[0].score } : null,
        })),
      };
      return res.json(results);
    }

    const assignments = await Assignment.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: AssignmentSubmission,
          include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }],
          as: 'AssignmentSubmissions',
        },
      ],
    });
    const quizzes = await Quiz.findAll({
      where: { course_id: courseId },
      include: [
        {
          model: QuizAttempt,
          include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }],
          as: 'QuizAttempts',
        },
      ],
    });
    res.json({ assignments, quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
};
