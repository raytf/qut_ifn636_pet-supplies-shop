/**
 * Admin middleware for the Petopia admin system.
 * Must be chained after authMiddleware's `protect` — relies on req.user being set.
 * Rejects any request from a user whose role is not 'admin' with HTTP 403.
 */

/**
 * @desc  Checks that the authenticated user has the 'admin' role.
 *        Call after `protect` middleware: router.get('/', protect, adminCheck, handler)
 * @access Private (admin only)
 */
const adminCheck = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        // User is an admin — allow the request to proceed
        next();
    } else {
        // User is authenticated but lacks admin privileges
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { adminCheck };
