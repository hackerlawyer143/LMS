const { Enrollment, Course, User } = require('../models');

exports.myEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.userId },
      include: [
        { model: Course, include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }] },
      ],
      order: [['enrolled_at', 'DESC']],
    });
    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

exports.enroll = async (req, res) => {
  try {
    const { courseId } = req.body;
    if (!courseId) return res.status(400).json({ error: 'courseId required' });

    const course = await Course.findByPk(courseId);
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const existing = await Enrollment.findOne({
      where: { user_id: req.userId, course_id: courseId },
    });
    if (existing) return res.status(400).json({ error: 'Already enrolled' });

    if (Number(course.price) === 0) {
      const enrollment = await Enrollment.create({
        user_id: req.userId,
        course_id: courseId,
        status: 'active',
      });
      const withCourse = await Enrollment.findByPk(enrollment.id, {
        include: [
          { model: Course, include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }] },
        ],
      });
      return res.status(201).json({ message: 'Enrolled', enrollment: withCourse, requiresPayment: false });
    }

    return res.status(200).json({
      message: 'Paid course - complete payment to enroll',
      requiresPayment: true,
      courseId: course.id,
      amount: course.price,
      currency: 'INR',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Enrollment failed' });
  }
};
