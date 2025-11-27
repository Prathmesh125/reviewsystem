import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/FirebaseAuthContext';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const EmailVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const { user, sendEmailVerification, refreshUser, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user?.emailVerified) {
      navigate('/dashboard');
      return;
    }

    // If no user, redirect to login
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Cooldown timer for resend button
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendVerification = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      await sendEmailVerification();
      setMessage('Verification email sent successfully! Please check your inbox and spam folder.');
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setIsChecking(true);
    setMessage('');

    try {
      const isVerified = await refreshUser();
      if (isVerified) {
        setMessage('Email verified successfully! Redirecting to dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage('Email not yet verified. Please check your email and click the verification link.');
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      setMessage(`Error signing out: ${error.message}`);
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              We've sent a verification email to{' '}
              <span className="font-semibold text-blue-600">{user.email}</span>
            </p>
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700'
                : message.includes('successfully')
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-blue-50 border border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center">
                {message.includes('Error') ? (
                  <AlertCircle className="w-5 h-5 mr-2" />
                ) : message.includes('successfully') ? (
                  <CheckCircle className="w-5 h-5 mr-2" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">What to do next:</h3>
              <ol className="text-sm text-gray-600 space-y-1 text-left">
                <li>1. Check your email inbox</li>
                <li>2. Look for an email from Firebase Auth</li>
                <li>3. Click the verification link</li>
                <li>4. Return here and click "I've Verified"</li>
              </ol>
            </div>

            <Button
              onClick={handleCheckVerification}
              disabled={isChecking}
              className="w-full"
            >
              {isChecking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  I've Verified My Email
                </>
              )}
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={isLoading || resendCooldown > 0}
              variant="outline"
              className="w-full"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend in ${resendCooldown}s`
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Wrong email address?
              </p>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                className="w-full"
              >
                Sign Out & Try Again
              </Button>
            </div>
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <p>Didn't receive the email? Check your spam folder or contact support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;