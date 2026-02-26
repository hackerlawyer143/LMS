const { Payment, Course, User } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');

exports.revenue = async (req, res) => {
  try {
    const total = await Payment.sum('amount', {
      where: { status: 'success' },
    });
    const byMonth = await Payment.findAll({
      attributes: [
        [sequelize.fn('DATE_FORMAT', sequelize.col('paid_at'), '%Y-%m'), 'month'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
      ],
      where: { status: 'success', paid_at: { [Op.ne]: null } },
      group: [sequelize.fn('DATE_FORMAT', sequelize.col('paid_at'), '%Y-%m')],
      raw: true,
    });
    res.json({ total: total || 0, byMonth: byMonth || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch revenue' });
  }
};

exports.payments = async (req, res) => {
  try {
    const { status, from, to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at[Op.gte] = new Date(from);
      if (to) where.created_at[Op.lte] = new Date(to);
    }
    const payments = await Payment.findAll({
      where,
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: User, as: 'User', attributes: ['id', 'full_name', 'email'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};
