const checkRole = (requiredRole) => {
    return (req, res, next) => {
      if (req.user.role !== requiredRole) {
        return res.status(403).json({ error: 'Недостаточно прав' });
      }
      next();
    };
  };
  
  module.exports = checkRole;
  