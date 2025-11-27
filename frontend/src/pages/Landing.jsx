import { Link } from 'react-router-dom'
import { 
  ArrowRight, 
  QrCode, 
  Star, 
  Users, 
  TrendingUp, 
  Shield, 
  CheckCircle, 
  BarChart3,
  Sparkles,
  Building2,
  Eye,
  MessageSquare,
  Award
} from 'lucide-react'
import Button from '../components/ui/Button'

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">ReviewSystem</span>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base"
              >
                Sign In
              </Link>
              <Link to="/register">
                <Button className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base px-3 sm:px-4 py-2">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16 lg:py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sm:mb-8">
              <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs sm:text-sm font-medium">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                AI-Powered Review Generation
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Transform Customer Experience Into 
              <span className="text-blue-600"> Authentic Reviews</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              Generate smart QR codes that help your customers write genuine Google reviews 
              with AI assistance. Boost your online reputation effortlessly.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="flex items-center justify-center gap-2 w-full sm:w-auto">
                  Start Free Trial 
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="text-center mb-12 sm:mb-16 px-4 sm:px-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything you need to boost your reviews
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive tools to generate, manage, and analyze customer reviews with AI assistance
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <QrCode className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Smart QR Codes</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Generate custom QR codes that link directly to your review collection page with your branding and business information.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">AI-Powered Reviews</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Help customers write authentic, detailed reviews with our intelligent AI assistant that guides them through the process.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Analytics Dashboard</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Track QR code scans, review conversions, customer engagement, and detailed performance metrics in real-time.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Multi-Business Management</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Manage multiple business locations from a single dashboard with individual QR codes and analytics for each.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Review Moderation</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Built-in moderation tools with admin controls to ensure quality reviews and manage customer feedback effectively.
              </p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 sm:mb-6">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Customer Insights</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                Gain valuable insights into customer satisfaction, trends, and feedback patterns to improve your business.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 lg:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Trusted by businesses worldwide
              </h2>
              <p className="text-base sm:text-lg text-gray-600">
                Join thousands of businesses already boosting their online reputation
              </p>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 text-center">
              <div className="p-3 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">500+</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">Active Businesses</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Across all industries</div>
              </div>
              <div className="p-3 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">10k+</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">Reviews Generated</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">High-quality feedback</div>
              </div>
              <div className="p-3 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">25k+</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">QR Code Scans</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Customer interactions</div>
              </div>
              <div className="p-3 sm:p-6">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">98%</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">Satisfaction Rate</div>
                <div className="text-xs sm:text-sm text-gray-500 mt-1">Happy customers</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-12 sm:py-16 lg:py-20">
          <div className="bg-blue-600 rounded-xl p-6 sm:p-8 lg:p-12 text-center text-white">
            <div className="max-w-3xl mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Award className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                Ready to boost your online reputation?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 px-4 sm:px-0">
                Start generating authentic reviews today with our AI-powered platform
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-gray-50 hover:text-blue-700 w-full sm:w-auto font-semibold"
                  >
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Get Started Free
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-blue-300 border-2 text-white hover:bg-blue-500 hover:border-blue-400 w-full sm:w-auto font-semibold"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <QrCode className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <span className="text-lg sm:text-xl font-bold text-gray-900">ReviewSystem</span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 max-w-md">
                The complete solution for generating authentic customer reviews with AI assistance. 
                Boost your online reputation effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                  SOC 2 Compliant
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                  Enterprise Security
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">Support</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-xs sm:text-sm text-center md:text-left">
              © 2025 ReviewSystem. All rights reserved.
            </p>
            <div className="flex items-center gap-4 sm:gap-6 mt-3 md:mt-0 text-xs sm:text-sm text-gray-600">
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Landing