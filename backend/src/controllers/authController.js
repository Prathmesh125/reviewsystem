const { PrismaClient } = require('@prisma/client')
const { body, validationResult } = require('express-validator')
const {
  hashPassword,
  comparePassword,
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateUserResponse,
  validatePassword,
  validateEmail
} = require('../utils/auth')

const prisma = new PrismaClient()

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters long'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters long'),
  body('businessName')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business name must be at least 2 characters long'),
  body('businessType')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('Business type must be at least 2 characters long')
]

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// Register new user
const register = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const {
      email,
      password,
      firstName,
      lastName,
      businessName,
      businessType,
      businessPhone,
      businessAddress,
      businessWebsite
    } = req.body

    // Additional password validation
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Password validation failed',
        details: passwordValidation.errors
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        businessName,
        businessType,
        businessPhone,
        businessAddress,
        businessWebsite,
        role: 'BUSINESS_OWNER' // Default role
      }
    })

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Return user data without password
    const userResponse = generateUserResponse(user)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token,
      refreshToken
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Registration failed',
      message: error.message
    })
  }
}

// Login user
const login = async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      })
    }

    const { email, password } = req.body

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account has been deactivated. Please contact support.'
      })
    }

    // Compare password
    const isValidPassword = await comparePassword(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate tokens
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)

    // Update last login (optional)
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    })

    // Return user data without password
    const userResponse = generateUserResponse(user)

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      refreshToken
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    })
  }
}

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        error: 'Refresh token required'
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)

    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      })
    }

    // Generate new access token
    const newToken = generateToken(user.id)

    res.json({
      success: true,
      token: newToken
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    })
  }
}

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        businesses: {
          select: {
            id: true,
            name: true,
            type: true,
            isPublished: true,
            createdAt: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    const userResponse = generateUserResponse(user)

    res.json({
      success: true,
      user: userResponse
    })

  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    })
  }
}

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      businessName,
      businessType,
      businessPhone,
      businessAddress,
      businessWebsite
    } = req.body

    // Validate input
    if (firstName && firstName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'First name must be at least 2 characters long'
      })
    }

    if (lastName && lastName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Last name must be at least 2 characters long'
      })
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(firstName && { firstName: firstName.trim() }),
        ...(lastName && { lastName: lastName.trim() }),
        ...(businessName && { businessName: businessName.trim() }),
        ...(businessType && { businessType: businessType.trim() }),
        ...(businessPhone && { businessPhone: businessPhone.trim() }),
        ...(businessAddress && { businessAddress: businessAddress.trim() }),
        ...(businessWebsite && { businessWebsite: businessWebsite.trim() })
      }
    })

    const userResponse = generateUserResponse(updatedUser)

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    })

  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update profile'
    })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Current password and new password are required'
      })
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'New password validation failed',
        details: passwordValidation.errors
      })
    }

    // Get current user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    })

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword }
    })

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    })
  }
}

// Logout (optional - mainly for logging purposes)
const logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log it for analytics
    console.log(`User ${req.user.id} logged out at ${new Date().toISOString()}`)

    res.json({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    })
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  registerValidation,
  loginValidation
}