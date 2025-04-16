module.exports = (req, res, next) => {
  if (req.user.role !== 'RIDER') {
    return res.status(403).json({ message: 'Rider access required' });
  }
  next();
};