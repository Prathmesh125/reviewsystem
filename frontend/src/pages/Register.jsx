import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, User, Mail, Lock, Building, Phone, MapPin, Globe } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: '',
    businessPhone: '',
    businessAddress: '',
    businessWebsite: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  
  const { register, isLoading, error } = useAuth()
  const navigate = useNavigate()

  const businessTypes = [
    'restaurant',
    'salon',
    'automotive',
    'retail',
    'healthcare',
    'fitness',
    'education',
    'professional_services',
    'entertainment',
    'other'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors = {}
    
    if (!formData.businessName.trim()) {
      newErrors.businessName = 'Business name is required'
    } else if (formData.businessName.trim().length < 2) {
      newErrors.businessName = 'Business name must be at least 2 characters'
    }
    
    if (!formData.businessType) {
      newErrors.businessType = 'Please select a business type'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleStep1Submit = (e) => {
    e.preventDefault()
    if (validateStep1()) {
      setCurrentStep(2)
    }
  }

  const handleStep2Submit = async (e) => {
    e.preventDefault()
    
    if (!validateStep2()) return
    
    const result = await register({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      businessName: formData.businessName.trim(),
      businessType: formData.businessType,
      businessPhone: formData.businessPhone.trim() || undefined,
      businessAddress: formData.businessAddress.trim() || undefined,
      businessWebsite: formData.businessWebsite.trim() || undefined
    })
    
    if (result.success) {
      navigate('/dashboard')
    }
  }

  const goBackToStep1 = () => {
    setCurrentStep(1)
    setErrors({})
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">RS</span>
            </div>
            <span className="text-xl font-bold text-gray-900">ReviewSystem</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            sign in to existing account
          </Link>
        </p>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              1
            </div>
            <div className={`w-8 h-0.5 ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
              currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              2
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-3">
              <p className="text-sm text-error-600">{error}</p>
            </div>
          )}

          {currentStep === 1 ? (
            <form className="space-y-6" onSubmit={handleStep1Submit}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                <p className="text-sm text-gray-600">Let's start with your basic details</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  label="First name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="John"
                />
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  label="Last name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="Smith"
                />
              </div>

              <Input
                id="email"
                name="email"
                type="email"
                label="Email address"
                required
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="john@example.com"
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ top: '24px' }}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ top: '24px' }}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>

              <Button type="submit" className="w-full">
                Continue to Business Info
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleStep2Submit}>
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">Business Information</h3>
                <p className="text-sm text-gray-600">Tell us about your business</p>
              </div>

              <Input
                id="businessName"
                name="businessName"
                type="text"
                label="Business name"
                required
                value={formData.businessName}
                onChange={handleChange}
                error={errors.businessName}
                placeholder="Amazing Pizza Restaurant"
              />

              <div>
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-1">
                  Business type <span className="text-error-500 ml-1">*</span>
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                >
                  <option value="">Select business type</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                {errors.businessType && (
                  <p className="mt-1 text-xs text-error-600">{errors.businessType}</p>
                )}
              </div>

              <Input
                id="businessPhone"
                name="businessPhone"
                type="tel"
                label="Business phone"
                value={formData.businessPhone}
                onChange={handleChange}
                error={errors.businessPhone}
                placeholder="+1 (555) 123-4567"
                hint="Optional"
              />

              <Input
                id="businessAddress"
                name="businessAddress"
                type="text"
                label="Business address"
                value={formData.businessAddress}
                onChange={handleChange}
                error={errors.businessAddress}
                placeholder="123 Main St, City, State 12345"
                hint="Optional"
              />

              <Input
                id="businessWebsite"
                name="businessWebsite"
                type="url"
                label="Business website"
                value={formData.businessWebsite}
                onChange={handleChange}
                error={errors.businessWebsite}
                placeholder="https://yourwebsite.com"
                hint="Optional"
              />

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goBackToStep1}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Create Account
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default Register