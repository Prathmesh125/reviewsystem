const { auth } = require('../config/firebase');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    // Check if Firebase is initialized
    if (!auth) {
      return res.status(503).json({ 
        message: 'Firebase authentication is not configured. Please add service account key.' 
      });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Authorization header is required' 
      });
    }

    const idToken = authHeader.split(' ')[1];
    
    console.log('Verifying Firebase token for analytics request...');
    
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    console.log('Token verified - User UID:', decodedToken.uid, 'Email:', decodedToken.email);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      ...decodedToken
    };
    
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: 'Token has expired' 
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ 
        message: 'Token has been revoked' 
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid or expired token' 
    });
  }
};

// Middleware to check user role from Firestore
const checkUserRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const { db } = require('../config/firebase');
      
      // Check if Firebase is initialized
      if (!db) {
        return res.status(503).json({ 
          message: 'Firebase database is not configured. Please add service account key.' 
        });
      }
      
      if (!req.user || !req.user.uid) {
        return res.status(401).json({ 
          message: 'User not authenticated' 
        });
      }
      
      // Get user document from Firestore
      const userDoc = await db.collection('users').doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return res.status(404).json({ 
          message: 'User not found' 
        });
      }
      
      const userData = userDoc.data();
      req.user.role = userData.role;
      req.user.userData = userData;
      
      if (requiredRole && userData.role !== requiredRole) {
        return res.status(403).json({ 
          message: 'Insufficient permissions' 
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ 
        message: 'Error verifying user role' 
      });
    }
  };
};

module.exports = {
  verifyFirebaseToken,
  checkUserRole
};