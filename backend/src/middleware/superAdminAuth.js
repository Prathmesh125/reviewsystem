const { auth } = require('../config/firebase');

// List of super admin email addresses (in production, this would be in a database)
const SUPER_ADMIN_EMAILS = [
  'millrockindustries@gmail.com', // Current user for testing
  'admin@reviewsystem.com',
  'superadmin@reviewsystem.com'
];

const verifySuperAdmin = async (req, res, next) => {
  try {
    // First verify Firebase token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: 'Authorization header is required' 
      });
    }

    const idToken = authHeader.split(' ')[1];
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    // Check if user is a super admin
    if (!SUPER_ADMIN_EMAILS.includes(decodedToken.email)) {
      return res.status(403).json({
        success: false,
        message: 'Super admin access required'
      });
    }
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isSuperAdmin: true,
      ...decodedToken
    };
    
    console.log('Super Admin authenticated:', decodedToken.email);
    next();
    
  } catch (error) {
    console.error('Super Admin authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

module.exports = { verifySuperAdmin, SUPER_ADMIN_EMAILS };