const express = require('express');
const { verifyFirebaseToken, checkUserRole } = require('../middleware/firebaseAuth');
const { db } = require('../config/firebase');

const router = express.Router();

// Get current user profile
router.get('/profile', verifyFirebaseToken, checkUserRole(), async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data();
    
    res.json({
      uid: req.user.uid,
      email: req.user.email,
      emailVerified: req.user.emailVerified,
      ...userData
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Update user profile
router.put('/profile', verifyFirebaseToken, checkUserRole(), async (req, res) => {
  try {
    const { name, role } = req.body;
    
    const updateData = {
      updatedAt: new Date()
    };
    
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    await db.collection('users').doc(req.user.uid).update(updateData);
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
});

// Verify token endpoint (for checking auth status)
router.get('/verify', verifyFirebaseToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.uid).get();
    
    let userData = {};
    if (userDoc.exists) {
      userData = userDoc.data();
    }
    
    res.json({
      valid: true,
      user: {
        uid: req.user.uid,
        email: req.user.email,
        emailVerified: req.user.emailVerified,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Error verifying token' });
  }
});

// Admin only route - Get all users
router.get('/users', verifyFirebaseToken, checkUserRole('SUPER_ADMIN'), async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

module.exports = router;