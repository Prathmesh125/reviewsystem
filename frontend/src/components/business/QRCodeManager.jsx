import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  QrCode, 
  Eye, 
  Copy,
  BarChart3,
  Settings,
  Loader2,
  ExternalLink,
  Share2,
  TrendingUp,
  Calendar,
  Globe,
  Activity
} from 'lucide-react';
import Button from '../ui/Button';
import Modal from '../ui/Modal';
import { useAuth } from '../../contexts/FirebaseAuthContext';
import QRCode from 'react-qr-code';

const QRCodeManager = ({ businessId, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [selectedQRCode, setSelectedQRCode] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  // Form state for creating/editing QR codes
  const [formData, setFormData] = useState({
    title: 'Leave us a review',
    backgroundColor: '#FFFFFF',
    foregroundColor: '#000000',
    size: 300,
    errorCorrection: 'M'
  });

  useEffect(() => {
    loadQRCodes();
  }, [businessId]);

  const loadQRCodes = async () => {
    try {
      setLoading(true);
      const token = await user.getIdToken();
      const response = await fetch('/api/qr-codes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load QR codes');
      }

      const data = await response.json();
      setQrCodes(data);
    } catch (error) {
      console.error('Error loading QR codes:', error);
      toast.error('Failed to load QR codes');
    } finally {
      setLoading(false);
    }
  };

  const createQRCode = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/qr-codes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to create QR code');
      }

      const newQRCode = await response.json();
      setQrCodes([newQRCode, ...qrCodes]);
      setShowCreateModal(false);
      resetForm();
      toast.success('QR code created successfully!');
    } catch (error) {
      console.error('Error creating QR code:', error);
      toast.error('Failed to create QR code');
    }
  };

  const updateQRCode = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/qr-codes/${selectedQRCode.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Failed to update QR code');
      }

      const updatedQRCode = await response.json();
      setQrCodes(qrCodes.map(qr => qr.id === updatedQRCode.id ? updatedQRCode : qr));
      setShowEditModal(false);
      setSelectedQRCode(null);
      resetForm();
      toast.success('QR code updated successfully!');
    } catch (error) {
      console.error('Error updating QR code:', error);
      toast.error('Failed to update QR code');
    }
  };

  const deleteQRCode = async (qrCodeId) => {
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/qr-codes/${qrCodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete QR code');
      }

      setQrCodes(qrCodes.filter(qr => qr.id !== qrCodeId));
      toast.success('QR code deleted successfully!');
    } catch (error) {
      console.error('Error deleting QR code:', error);
      toast.error('Failed to delete QR code');
    }
  };

  const downloadQRCode = async (qrCode) => {
    try {
      const response = await fetch(`/api/qr-codes/${qrCode.id}/download?format=png`);
      
      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${qrCode.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('QR code downloaded successfully!');
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  const copyQRCodeURL = async (qrCode) => {
    try {
      await navigator.clipboard.writeText(qrCode.qrCodeUrl);
      toast.success('QR code URL copied to clipboard!');
    } catch (error) {
      console.error('Error copying URL:', error);
      toast.error('Failed to copy URL');
    }
  };

  const loadAnalytics = async (qrCode) => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/qr-codes/${qrCode.id}/analytics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
      setSelectedQRCode(qrCode);
      setShowAnalyticsModal(true);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  const openEditModal = (qrCode) => {
    setSelectedQRCode(qrCode);
    setFormData({
      title: qrCode.title,
      backgroundColor: qrCode.backgroundColor,
      foregroundColor: qrCode.foregroundColor,
      size: qrCode.size,
      errorCorrection: qrCode.errorCorrection
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: 'Leave us a review',
      backgroundColor: '#FFFFFF',
      foregroundColor: '#000000',
      size: 300,
      errorCorrection: 'M'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">QR Code Manager</h2>
            <p className="text-gray-600 text-sm">Create and manage QR codes for your review forms</p>
          </div>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create QR Code</span>
          <span className="sm:hidden">Create</span>
        </Button>
      </div>

      {/* Stats Overview */}
      {qrCodes.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total QR Codes</p>
                <p className="text-2xl font-bold text-blue-700">{qrCodes.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Total Scans</p>
                <p className="text-2xl font-bold text-green-700">
                  {qrCodes.reduce((total, qr) => total + (qr.scansCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Active QR Codes</p>
                <p className="text-2xl font-bold text-purple-700">
                  {qrCodes.filter(qr => qr.isActive !== false).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Avg. Daily Scans</p>
                <p className="text-2xl font-bold text-orange-700">
                  {Math.round(qrCodes.reduce((total, qr) => total + (qr.scansCount || 0), 0) / Math.max(qrCodes.length, 1))}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR Codes Grid */}
      {qrCodes.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-200">
          <div className="max-w-md mx-auto">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No QR codes yet</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Create your first QR code to start collecting reviews from your customers. 
              QR codes make it easy for customers to access your review forms.
            </p>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First QR Code
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {qrCodes.map((qrCode) => (
            <div key={qrCode.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group">
              {/* QR Code Preview */}
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm border">
                    <QRCode
                      value={qrCode.qrCodeUrl}
                      size={100}
                      bgColor={qrCode.backgroundColor}
                      fgColor={qrCode.foregroundColor}
                    />
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    qrCode.isActive !== false 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {qrCode.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* QR Code Info */}
              <div className="p-4">
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 mb-1 truncate" title={qrCode.title}>
                    {qrCode.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {qrCode.scansCount || 0} scans
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(qrCode.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadQRCode(qrCode)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyQRCodeURL(qrCode)}
                    className="flex items-center justify-center gap-1 text-xs"
                  >
                    <Copy className="w-3 h-3" />
                    Copy URL
                  </Button>
                </div>

                {/* More Actions */}
                <div className="grid grid-cols-3 gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => loadAnalytics(qrCode)}
                    className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <BarChart3 className="w-3 h-3" />
                    <span className="hidden sm:inline">Analytics</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openEditModal(qrCode)}
                    className="flex items-center justify-center gap-1 text-xs text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                  >
                    <Edit className="w-3 h-3" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteQRCode(qrCode.id)}
                    className="flex items-center justify-center gap-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>

                {/* Preview Link */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <a
                    href={qrCode.qrCodeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Preview Form
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create QR Code Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New QR Code"
      >
        <QRCodeForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={createQRCode}
          onCancel={() => setShowCreateModal(false)}
          isEditing={false}
        />
      </Modal>

      {/* Edit QR Code Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit QR Code"
      >
        <QRCodeForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={updateQRCode}
          onCancel={() => setShowEditModal(false)}
          isEditing={true}
        />
      </Modal>

      {/* Analytics Modal */}
      <Modal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        title="QR Code Analytics"
        size="lg"
      >
        {analytics && (
          <QRCodeAnalytics
            qrCode={selectedQRCode}
            analytics={analytics}
            onClose={() => setShowAnalyticsModal(false)}
          />
        )}
      </Modal>
    </div>
  );
};

// QR Code Form Component
const QRCodeForm = ({ formData, setFormData, onSubmit, onCancel, isEditing }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Preview Section */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">QR Code Preview</h3>
          <div className="flex justify-center">
            <div className="p-6 bg-white rounded-xl shadow-sm border-2 border-gray-100">
              <QRCode
                value={`http://localhost:3000/review/preview`}
                size={window.innerWidth < 640 ? 120 : 150}
                bgColor={formData.backgroundColor}
                fgColor={formData.foregroundColor}
              />
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            This is how your QR code will appear
          </p>
        </div>

        {/* Form Fields */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">QR Code Settings</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Title */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  <QrCode className="w-4 h-4" />
                  QR Code Title
                </span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter a descriptive title for your QR code"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This title will help you identify this QR code in your dashboard
              </p>
            </div>

            {/* Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (pixels)
              </label>
              <input
                type="number"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: parseInt(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                min="100"
                max="1000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Recommended: 300-500px for print materials
              </p>
            </div>

            {/* Error Correction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Error Correction Level
              </label>
              <select
                value={formData.errorCorrection}
                onChange={(e) => setFormData({ ...formData, errorCorrection: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="L">Low (7%) - Smallest size</option>
                <option value="M">Medium (15%) - Balanced</option>
                <option value="Q">Quartile (25%) - Good damage resistance</option>
                <option value="H">High (30%) - Best damage resistance</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Higher levels can recover from more damage but result in denser QR codes
              </p>
            </div>

            {/* Background Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Background Color
              </label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                    title="Pick background color"
                  />
                  <div className="absolute inset-0 rounded-lg border-2 border-white pointer-events-none"></div>
                </div>
                <input
                  type="text"
                  value={formData.backgroundColor}
                  onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                  placeholder="#FFFFFF"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Usually white (#FFFFFF) for best scanning results
              </p>
            </div>

            {/* Foreground Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foreground Color
              </label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.foregroundColor}
                    onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer shadow-sm"
                    title="Pick foreground color"
                  />
                  <div className="absolute inset-0 rounded-lg border-2 border-white pointer-events-none"></div>
                </div>
                <input
                  type="text"
                  value={formData.foregroundColor}
                  onChange={(e) => setFormData({ ...formData, foregroundColor: e.target.value })}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-mono"
                  placeholder="#000000"
                  pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dark colors (#000000) work best for scanning. Ensure good contrast with background.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <QrCode className="w-4 h-4 mr-2" />
            )}
            {isEditing ? 'Update QR Code' : 'Create QR Code'}
          </Button>
        </div>
      </form>
    </div>
  );
};

// QR Code Analytics Component
const QRCodeAnalytics = ({ qrCode, analytics, onClose }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* QR Code Header */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <div className="p-4 bg-white rounded-xl shadow-sm border-2 border-gray-100">
              <QRCode
                value={qrCode.qrCodeUrl}
                size={100}
                bgColor={qrCode.backgroundColor}
                fgColor={qrCode.foregroundColor}
              />
            </div>
          </div>
          <div className="text-center sm:text-left flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{qrCode.title}</h3>
            <p className="text-gray-600 text-sm mb-3 break-all">{qrCode.qrCodeUrl}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                qrCode.isActive !== false 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                {qrCode.isActive !== false ? '✓ Active' : '○ Inactive'}
              </span>
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                Created {formatDate(qrCode.createdAt).date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-700">
                {analytics.analytics?.totalScans || 0}
              </div>
              <div className="text-sm text-blue-600 font-medium">Total Scans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500 rounded-lg">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-700">
                {qrCode.scansCount || 0}
              </div>
              <div className="text-sm text-green-600 font-medium">Lifetime Scans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-700">
                {analytics.analytics?.recentScans?.length || 0}
              </div>
              <div className="text-sm text-purple-600 font-medium">Recent Scans</div>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-700">
                {qrCode.isActive !== false ? 'Online' : 'Offline'}
              </div>
              <div className="text-sm text-orange-600 font-medium">Status</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Scan Activity
          </h4>
        </div>
        
        <div className="p-6">
          {!analytics.analytics?.recentScans || analytics.analytics.recentScans.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg font-medium mb-2">No scans yet</p>
              <p className="text-gray-500 text-sm">
                Once people start scanning your QR code, their activity will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.analytics.recentScans.map((scan, index) => {
                const { date, time } = formatDate(scan.scannedAt);
                let location = 'Unknown location';
                
                try {
                  if (scan.location) {
                    const loc = JSON.parse(scan.location);
                    location = loc.city || loc.country || 'Unknown location';
                  }
                } catch (e) {
                  // Keep default location
                }

                return (
                  <div key={scan.id || index} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <QrCode className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Scan #{analytics.analytics.recentScans.length - index}
                        </div>
                        <div className="text-xs text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {date} at {time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {location}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 sm:mt-0 text-xs text-gray-500 font-mono">
                      {scan.ipAddress ? `${scan.ipAddress.substring(0, 12)}...` : 'Unknown IP'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            onClick={() => window.open(qrCode.qrCodeUrl, '_blank')}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Form
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QRCodeManager;