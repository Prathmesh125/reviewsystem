// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Convert single role to array for consistency
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      })
    }

    next()
  }
}

// Specific role middleware functions
const requireSuperAdmin = requireRole('SUPER_ADMIN')
const requireBusinessOwner = requireRole('BUSINESS_OWNER')
const requireAnyRole = requireRole(['SUPER_ADMIN', 'BUSINESS_OWNER'])

// Resource ownership middleware (for business owners to access only their data)
const requireOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      })
    }

    // Super admins can access everything
    if (req.user.role === 'SUPER_ADMIN') {
      return next()
    }

    // Business owners can only access their own resources
    if (req.user.role === 'BUSINESS_OWNER') {
      // The ownership check will be done in the controller
      // This middleware just ensures the user is a business owner
      return next()
    }

    return res.status(403).json({
      success: false,
      error: 'Insufficient permissions'
    })
  }
}

module.exports = {
  requireRole,
  requireSuperAdmin,
  requireBusinessOwner,
  requireAnyRole,
  requireOwnership
}