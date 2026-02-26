const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { Assignment, AssignmentSubmission, Course, Enrollment, User } = require('../models');
const { body, validationResult } = require('express-validator');

const uploadDir = path.join(__dirname, '..', 'uploads', 'assignments');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safe = `${Date.now()}-${req.userId}-${(file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    cb(null, safe);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

exports.uploadMiddleware = upload.single('file');

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
      return res.status(403).json({ error: 'Not enrolled in this course' });
    }

    const assignments = await Assignment.findAll({
      where: { course_id: courseId },
      order: [['deadline', 'ASC']],
    });
    res.json(assignments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
};

exports.createValidators = [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('deadline').isISO8601(),
  body('max_marks').optional().isInt({ min: 1 }).toInt(),
];

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed to create assignment' });
    }

    const { title, description, deadline, max_marks = 100 } = req.body;
    const assignment = await Assignment.create({
      course_id: courseId,
      title,
      description: description || '',
      deadline,
      max_marks,
    });
    res.status(201).json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
};

exports.updateValidators = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('deadline').optional().isISO8601(),
  body('max_marks').optional().isInt({ min: 1 }).toInt(),
];

exports.update = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    const course = await Course.findByPk(assignment.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const { title, description, deadline, max_marks } = req.body;
    if (title !== undefined) assignment.title = title;
    if (description !== undefined) assignment.description = description;
    if (deadline !== undefined) assignment.deadline = deadline;
    if (max_marks !== undefined) assignment.max_marks = max_marks;
    await assignment.save();
    res.json(assignment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
};

exports.remove = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    const course = await Course.findByPk(assignment.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    await assignment.destroy();
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
};

exports.submit = async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: 'File required' });
    }
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const enrolled = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: assignment.course_id },
    });
    if (!enrolled) return res.status(403).json({ error: 'Not enrolled in this course' });

    if (new Date(assignment.deadline) < new Date()) {
      return res.status(400).json({ error: 'Deadline has passed' });
    }

    const [sub, created] = await AssignmentSubmission.findOrCreate({
      where: { assignment_id: assignment.id, user_id: req.userId },
      defaults: {
        assignment_id: assignment.id,
        user_id: req.userId,
        file_path: req.file.path.replace(/\\/g, '/'),
      },
    });
    if (!created) {
      sub.file_path = req.file.path.replace(/\\/g, '/');
      await sub.save();
    }
    res.status(201).json(sub);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submit failed' });
  }
};

exports.listSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    const course = await Course.findByPk(assignment.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const submissions = await AssignmentSubmission.findAll({
      where: { assignment_id: req.params.id },
      include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }],
    });
    res.json(submissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
};

exports.updateMarksValidators = [
  body('marks').isInt({ min: 0 }).toInt(),
  body('feedback').optional().trim(),
];

exports.updateMarks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const submission = await AssignmentSubmission.findByPk(req.params.submissionId);
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.assignment_id !== parseInt(req.params.id, 10)) {
      return res.status(400).json({ error: 'Submission does not belong to this assignment' });
    }
    const assignment = await Assignment.findByPk(submission.assignment_id);
    const course = await Course.findByPk(assignment.course_id);
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed' });
    }
    const { marks, feedback } = req.body;
    submission.marks = marks;
    if (feedback !== undefined) submission.feedback = feedback;
    await submission.save();
    res.json(submission);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update marks' });
  }
};
