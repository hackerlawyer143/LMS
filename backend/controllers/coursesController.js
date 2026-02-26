const { body, validationResult } = require('express-validator');
const { Course, User } = require('../models');
const { Op } = require('sequelize');

exports.list = async (req, res) => {
  try {
    const { search, freeOnly } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }
    if (freeOnly === 'true') where.price = 0;

    const courses = await Course.findAll({
      where,
      include: [
        { model: User, as: 'User', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['id', 'DESC']],
    });
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
};

exports.getById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'User', attributes: ['id', 'full_name', 'email'] },
      ],
    });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    res.json(course);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
};

exports.createValidators = [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
];

exports.create = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, description, price = 0 } = req.body;
    const course = await Course.create({
      title,
      description: description || '',
      price: Number(price),
      instructor_id: req.userId,
    });
    const withInstructor = await Course.findByPk(course.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }],
    });
    res.status(201).json(withInstructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create course' });
  }
};

exports.updateValidators = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
];

exports.update = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not allowed to edit this course' });
    }

    const { title, description, price } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = Number(price);
    await course.save();

    const withInstructor = await Course.findByPk(course.id, {
      include: [{ model: User, as: 'User', attributes: ['id', 'full_name', 'email'] }],
    });
    res.json(withInstructor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update course' });
  }
};

exports.remove = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    if (course.instructor_id !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete this course' });
    }
    await course.destroy();
    res.json({ message: 'Course deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
};
