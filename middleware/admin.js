// 401 Unauthorised - no valid token
// 403 Forbidden - not authorised to access

module.exports = function(req, res, next) {
  if (!req.user.isAdmin) return res.status(403).send('Access denied.');
  next();
};
