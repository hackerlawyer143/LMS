const { Quiz, QuizQuestion, QuizAttempt, Course, Enrollment } = require('../models');
const { body, validationResult } = require('express-validator');
const { Op } = require('sequelize');

exports.listByCourse = async (req, res) => {
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
    const quizzes = await Quiz.findAll({
      where: { course_id: courseId },
      order: [['id', 'DESC']],
    });
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

exports.getById = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: QuizQuestion, as: 'QuizQuestions', order: [['id', 'ASC']] }],
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const course = await Course.findByPk(quiz.course_id);
    const isInstructor = course.instructor_id === req.userId;
    const isAdmin = req.userRole === 'admin';
    const isEnrolled = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: quiz.course_id },
    });
    if (!isInstructor && !isAdmin && !isEnrolled) {
      return res.status(403).json({ error: 'Not enrolled' });
    }
    const out = quiz.toJSON();
    if (req.userRole !== 'faculty' && req.userRole !== 'admin') {
      out.QuizQuestions = (out.QuizQuestions || []).map((q) => ({
        id: q.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: undefined,
      }));
    }
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

exports.createValidators = [
  body('title').trim().notEmpty(),
  body('total_marks').optional().isInt({ min: 0 }).toInt(),
  body('duration_mins').optional().isInt({ min: 1 }).toInt(),
  body('questions').isArray(),
  body('questions.*.question_text').trim().notEmpty(),
  body('questions.*.options').isArray(),
  body('questions.*.correct_option_index').isInt({ min: 0 }),
];

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const { title, total_marks = 0, duration_mins = 30, questions } = req.body;
    const quiz = await Quiz.create({
      course_id: courseId,
      title,
      total_marks: Number(total_marks),
      duration_mins: Number(duration_mins),
    });

    let total = 0;
    const marksPerQuestion = questions.length > 0 ? Math.floor((total_marks || 100) / questions.length) : 0;
    for (const q of questions) {
      await QuizQuestion.create({
        quiz_id: quiz.id,
        question_text: q.question_text,
        options: q.options,
        correct_option_index: q.correct_option_index,
      });
      total += marksPerQuestion;
    }
    if (total !== quiz.total_marks) {
      quiz.total_marks = total;
      await quiz.save();
    }
    const withQuestions = await Quiz.findByPk(quiz.id, {
      include: [{ model: QuizQuestion, as: 'QuizQuestions' }],
    });
    res.status(201).json(withQuestions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

exports.updateValidators = [
  body('title').optional().trim().notEmpty(),
  body('total_marks').optional().isInt({ min: 0 }).toInt(),
  body('duration_mins').optional().isInt({ min: 1 }).toInt(),
];

exports.update = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const course = await Course.findByPk(quiz.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const { title, total_marks, duration_mins } = req.body;
    if (title !== undefined) quiz.title = title;
    if (total_marks !== undefined) quiz.total_marks = total_marks;
    if (duration_mins !== undefined) quiz.duration_mins = duration_mins;
    await quiz.save();
    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

exports.remove = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const course = await Course.findByPk(quiz.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    await quiz.destroy();
    res.json({ message: 'Quiz deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

exports.attemptValidators = [
  body('answers').isObject(),
];

exports.attempt = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const quiz = await Quiz.findByPk(req.params.id, {
      include: [{ model: QuizQuestion, as: 'QuizQuestions' }],
    });
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const enrolled = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: quiz.course_id },
    });
    if (!enrolled) return res.status(403).json({ error: 'Not enrolled' });

    const { answers } = req.body;
    const questions = quiz.QuizQuestions || [];
    let score = 0;
    const marksPerQ = questions.length > 0 ? Math.floor(quiz.total_marks / questions.length) : 0;
    for (const q of questions) {
      const selected = answers[q.id];
      if (Number(selected) === q.correct_option_index) {
        score += marksPerQ;
      }
    }
    const attempt = await QuizAttempt.create({
      quiz_id: quiz.id,
      user_id: req.userId,
      answers,
      score,
    });
    res.status(201).json({ attempt, score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Attempt failed' });
  }
};
