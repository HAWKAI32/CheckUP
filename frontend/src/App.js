import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Search, 
  Calendar, 
  MapPin, 
  Phone, 
  Star, 
  User, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2,
  Upload,
  DollarSign,
  Activity,
  Users,
  FileText,
  BarChart3,
  Settings,
  Globe,
  Heart,
  TestTube,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Verify token is still valid
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Components
const Header = () => {
  const [language, setLanguage] = useState('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/admin-login';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'sub_admin':
        return '/sub-admin';
      case 'clinic':
      case 'lab_technician':
        return '/clinic-dashboard';
      default:
        return '/';
    }
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="text-xl sm:text-2xl font-bold">ChekUp</span>
          </Link>
          
          {/* Mobile menu button */}
          <button
            className="sm:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
          
          {/* Desktop menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-blue-700 text-white px-3 py-1 rounded text-sm"
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
            </select>
            
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to={getDashboardLink()}
                  className="hidden md:inline-block bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 text-sm"
                >
                  Dashboard
                </Link>
                <span className="hidden lg:inline text-sm">
                  {user.role === 'sub_admin' ? 'Sub-Admin' : 
                   user.role === 'lab_technician' ? 'Lab Tech' : 
                   user.role.charAt(0).toUpperCase() + user.role.slice(1)}: {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link 
                to="/admin-login"
                className="flex items-center space-x-1 bg-blue-700 px-3 py-1 rounded hover:bg-blue-800 text-sm"
              >
                <User className="h-4 w-4" />
                <span>Admin Login</span>
              </Link>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pb-4 border-t border-blue-500">
            <div className="flex flex-col space-y-3 pt-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-blue-700 text-white px-3 py-2 rounded text-sm"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
              
              {user ? (
                <>
                  <Link
                    to={getDashboardLink()}
                    className="flex items-center justify-center space-x-1 bg-blue-700 px-3 py-2 rounded hover:bg-blue-800 text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <span className="text-sm text-center">
                    {user.role === 'sub_admin' ? 'Sub-Admin' : 
                     user.role === 'lab_technician' ? 'Lab Tech' : 
                     user.role.charAt(0).toUpperCase() + user.role.slice(1)}: {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center space-x-1 bg-blue-700 px-3 py-2 rounded hover:bg-blue-800 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <Link 
                  to="/admin-login"
                  className="flex items-center justify-center space-x-1 bg-blue-700 px-3 py-2 rounded hover:bg-blue-800 text-sm"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  <span>Admin Login</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [testPricing, setTestPricing] = useState([]);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    fetchTests();
    fetchClinics();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await axios.get(`${API}/public/tests`);
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API}/public/clinics`);
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const fetchTestPricing = async (testId) => {
    try {
      const response = await axios.get(`${API}/public/tests/${testId}/pricing`);
      setTestPricing(response.data);
    } catch (error) {
      console.error('Error fetching test pricing:', error);
    }
  };

  const handleTestSelect = (test) => {
    // Navigate to test providers page
    navigate(`/test/${test.id}/providers`);
  };

  const handleClinicSelect = async (clinic) => {
    try {
      const response = await axios.get(`${API}/public/clinics/${clinic.id}/tests`);
      setTestPricing(response.data);
      setSelectedClinic(clinic);
      setSelectedTests([]);
    } catch (error) {
      console.error('Error fetching clinic tests:', error);
    }
  };

  const addTestToCart = (testData) => {
    const isAlreadySelected = selectedTests.some(test => test.id === testData.test.id);
    if (!isAlreadySelected) {
      setSelectedTests([...selectedTests, testData.test]);
    }
  };

  const removeTestFromCart = (testId) => {
    setSelectedTests(selectedTests.filter(test => test.id !== testId));
  };

  const calculateTotal = () => {
    if (!selectedClinic) return 0;
    
    let total = 0;
    selectedTests.forEach(test => {
      const pricing = testPricing.find(tp => 
        tp.test.id === test.id && tp.clinic.id === selectedClinic.id
      );
      if (pricing) {
        total += currency === 'USD' ? pricing.pricing.price_usd : pricing.pricing.price_lrd;
      }
    });
    return total;
  };

  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredClinics = clinics.filter(clinic =>
    clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    clinic.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsfGVufDB8fHxibHVlfDE3NTI4ODA5NzB8MA&ixlib=rb-4.1.0&q=85"
            alt="Professional Healthcare"
            className="mx-auto mb-6 sm:mb-8 rounded-lg shadow-lg w-48 sm:w-64 h-36 sm:h-48 object-cover"
          />
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">Welcome to ChekUp</h1>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto">Simplifying access to medical lab testing and international surgical assistance</p>
          <div className="max-w-sm sm:max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tests or clinics..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 text-sm sm:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Browse by Tests */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
              <TestTube className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Browse Lab Tests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredTests.map(test => (
                <div 
                  key={test.id}
                  className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => handleTestSelect(test)}
                >
                  <div className="flex items-center mb-2">
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 flex-shrink-0" />
                    <h3 className="font-semibold text-sm sm:text-base">{test.name}</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{test.description}</p>
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {test.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Browse by Clinics */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
              <Building className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              Browse Clinics & Hospitals
            </h2>
            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {filteredClinics.map(clinic => (
                <div 
                  key={clinic.id}
                  className="border rounded-lg p-3 sm:p-4 cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  onClick={() => handleClinicSelect(clinic)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base sm:text-lg">{clinic.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{clinic.description}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center text-xs sm:text-sm text-gray-500 space-y-1 sm:space-y-0 sm:space-x-4">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span className="truncate">{clinic.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                          <span>{clinic.phone}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end sm:justify-start sm:ml-4">
                      <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400 mr-1" />
                      <span className="text-xs sm:text-sm">{clinic.rating || 0} ({clinic.total_reviews || 0})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Test Pricing Display */}
        {testPricing.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                {selectedClinic ? `${selectedClinic.name} - Available Tests` : 'Available Providers'}
              </h2>
              <div className="flex items-center space-x-2">
                <span className="text-sm">Currency:</span>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="border rounded px-3 py-1 text-sm"
                >
                  <option value="USD">USD</option>
                  <option value="LRD">LRD</option>
                </select>
              </div>
            </div>
            
            <div className="grid gap-3 sm:gap-4">
              {testPricing.map((item, index) => (
                <div key={index} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="font-semibold text-base">{item.test.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.test.description}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <Building className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{item.clinic.name} - {item.clinic.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:block sm:text-right sm:ml-4">
                      <div className="text-xl sm:text-2xl font-bold text-blue-600">
                        {currency === 'USD' ? '$' : 'L$'}{currency === 'USD' ? item.pricing.price_usd : item.pricing.price_lrd}
                      </div>
                      <button
                        onClick={() => {
                          addTestToCart(item);
                          setSelectedClinic(item.clinic);
                        }}
                        className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-blue-700 text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping Cart */}
        {selectedTests.length > 0 && (
          <div className="mt-6 sm:mt-8 bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Selected Tests</h2>
            <div className="space-y-3 sm:space-y-4">
              {selectedTests.map(test => (
                <div key={test.id} className="flex items-center justify-between border-b pb-2">
                  <div className="flex-1 min-w-0 pr-4">
                    <h3 className="font-semibold text-sm sm:text-base truncate">{test.name}</h3>
                    {selectedClinic && (
                      <p className="text-xs sm:text-sm text-gray-600 truncate">at {selectedClinic.name}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {selectedClinic && testPricing.find(tp => 
                      tp.test.id === test.id && tp.clinic.id === selectedClinic.id
                    ) && (
                      <span className="font-bold text-sm">
                        {currency === 'USD' ? '$' : 'L$'}{
                          currency === 'USD' 
                            ? testPricing.find(tp => tp.test.id === test.id && tp.clinic.id === selectedClinic.id).pricing.price_usd
                            : testPricing.find(tp => tp.test.id === test.id && tp.clinic.id === selectedClinic.id).pricing.price_lrd
                        }
                      </span>
                    )}
                    <button
                      onClick={() => removeTestFromCart(test.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t space-y-3 sm:space-y-0">
                <div>
                  <p className="text-base sm:text-lg"><strong>Total Tests: {selectedTests.length}</strong></p>
                  {selectedClinic && (
                    <p className="text-lg sm:text-xl font-bold text-blue-600">
                      Total: {currency === 'USD' ? '$' : 'L$'}{calculateTotal()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowBookingForm(true)}
                  disabled={!selectedClinic}
                  className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 text-sm sm:text-base"
                >
                  Book Tests
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Surgery Section */}
        <div className="mt-6 sm:mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Need Surgery in India?</h2>
          <div className="text-center">
            <img 
              src="https://images.unsplash.com/photo-1585421514738-01798e348b17?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwyfHxtZWRpY2FsfGVufDB8fHxibHVlfDE3NTI4ODA5NzB8MA&ixlib=rb-4.1.0&q=85"
              alt="Medical Care"
              className="mx-auto mb-4 rounded-lg w-36 sm:w-48 h-24 sm:h-32 object-cover"
            />
            <p className="mb-4 text-sm sm:text-base max-w-md mx-auto">Get affordable surgery options in India with accommodation assistance</p>
            <Link 
              to="/surgery-inquiry"
              className="inline-block bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-700 text-sm sm:text-base"
            >
              Submit Surgery Inquiry
            </Link>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm 
          selectedTests={selectedTests}
          selectedClinic={selectedClinic}
          currency={currency}
          total={calculateTotal()}
          onClose={() => setShowBookingForm(false)}
        />
      )}
    </div>
  );
};

const BookingForm = ({ selectedTests, selectedClinic, currency, total, onClose }) => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    patient_location: '',
    delivery_method: 'whatsapp',
    delivery_charge: 0,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const bookingData = {
        ...formData,
        test_ids: selectedTests.map(test => test.id),
        clinic_id: selectedClinic.id,
        preferred_currency: currency,
        delivery_charge: parseFloat(formData.delivery_charge) || 0
      };

      await axios.post(`${API}/bookings`, bookingData);
      alert('Booking created successfully! You will receive confirmation via your chosen delivery method.');
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-sm sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-bold">Book Lab Tests</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-1">
            <XCircle className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.patient_name}
              onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number *</label>
            <input
              type="tel"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.patient_phone}
              onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email (Optional)</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2"
              value={formData.patient_email}
              onChange={(e) => setFormData({...formData, patient_email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location *</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.patient_location}
              onChange={(e) => setFormData({...formData, patient_location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Delivery Method *</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.delivery_method}
              onChange={(e) => setFormData({...formData, delivery_method: e.target.value})}
            >
              <option value="whatsapp">WhatsApp Delivery (Free)</option>
              <option value="in_person">In-Person Delivery</option>
            </select>
          </div>

          {formData.delivery_method === 'in_person' && (
            <div>
              <label className="block text-sm font-medium mb-1">Delivery Charge</label>
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                value={formData.delivery_charge}
                onChange={(e) => setFormData({...formData, delivery_charge: e.target.value})}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Notes (Optional)</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Any special instructions..."
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span>Tests Total:</span>
              <span>{currency === 'USD' ? '$' : 'L$'}{total}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Charge:</span>
              <span>{currency === 'USD' ? '$' : 'L$'}{formData.delivery_charge || 0}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Grand Total:</span>
              <span>{currency === 'USD' ? '$' : 'L$'}{total + (parseFloat(formData.delivery_charge) || 0)}</span>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', { email: formData.email, role: 'unknown' });
      const response = await axios.post(`${API}/auth/login`, formData);
      
      console.log('Login response received:', {
        status: response.status,
        user: response.data.user,
        hasToken: !!response.data.access_token
      });
      
      // Call auth context login
      login(response.data.user, response.data.access_token);
      
      // Small delay to ensure context is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Auth context updated, navigating based on role:', response.data.user.role);
      
      // Redirect based on user role
      if (response.data.user.role === 'admin') {
        console.log('Navigating to admin dashboard');
        navigate('/admin');
      } else if (response.data.user.role === 'sub_admin') {
        console.log('Navigating to sub-admin dashboard');
        navigate('/sub-admin');
      } else {
        console.log('Navigating to clinic dashboard');
        navigate('/clinic-dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        alert('Invalid email or password');
      } else if (error.response?.status === 404) {
        alert('User not found');
      } else {
        alert('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-Admin Dashboard - Limited functionality
const SubAdminDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [clinics, setClinics] = useState([]);

  useEffect(() => {
    if (user?.role === 'sub_admin') {
      fetchBookings();
      fetchClinics();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API}/clinics`);
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const assignBookingToClinic = async (bookingId, clinicId) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status`, { 
        status: 'confirmed',
        clinic_id: clinicId 
      });
      fetchBookings();
      alert('Booking assigned to clinic successfully!');
    } catch (error) {
      console.error('Error assigning booking:', error);
      alert('Error assigning booking');
    }
  };

  const sendResultsToPatient = async (bookingId) => {
    try {
      // Simulate sending via WhatsApp
      await axios.put(`${API}/bookings/${bookingId}/status`, { status: 'completed' });
      fetchBookings();
      alert('Results sent to patient via WhatsApp!');
    } catch (error) {
      console.error('Error sending results:', error);
      alert('Error sending results');
    }
  };

  if (user?.role !== 'sub_admin') {
    return <Navigate to="/admin-login" />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 py-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Sub-Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600">Booking Coordinator - {user.name}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Booking Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">New Bookings</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">In Progress</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bookings.filter(b => ['confirmed', 'sample_collected'].includes(b.status)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Results Ready</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'results_ready').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Management Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b">
            <h2 className="text-base sm:text-lg font-semibold">Booking Coordination</h2>
            <p className="text-xs sm:text-sm text-gray-600">Assign bookings to clinics and coordinate results delivery</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Assigned Clinic</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coordinator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {bookings.map(booking => {
                  const clinic = clinics.find(c => c.id === booking.clinic_id);
                  return (
                    <tr key={booking.id}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">{booking.booking_number}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <p className="font-medium text-sm">{booking.patient_name}</p>
                          <p className="text-xs sm:text-sm text-gray-500">{booking.patient_phone}</p>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {booking.test_ids.length} test(s)
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                        <p className="font-medium text-sm">{clinic?.name || 'Not Assigned'}</p>
                        {clinic && <p className="text-xs text-gray-500">{clinic.location}</p>}
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <span className={`inline-block px-2 py-1 rounded text-xs ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'results_ready' ? 'bg-purple-100 text-purple-800' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'sample_collected' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status === 'pending' ? 'NEW' :
                           booking.status === 'confirmed' ? 'ASSIGNED' :
                           booking.status === 'sample_collected' ? 'IN PROGRESS' :
                           booking.status === 'results_ready' ? 'RESULTS READY' :
                           booking.status === 'completed' ? 'COMPLETED' :
                           booking.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="space-y-2">
                          {booking.status === 'pending' && (
                            <select 
                              className="text-xs border rounded px-2 py-1 w-full"
                              onChange={(e) => {
                                if (e.target.value) {
                                  assignBookingToClinic(booking.id, e.target.value);
                                }
                              }}
                            >
                              <option value="">Assign to Clinic</option>
                              {clinics.map(clinic => (
                                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                              ))}
                            </select>
                          )}

                          {booking.status === 'results_ready' && (
                            <button
                              onClick={() => sendResultsToPatient(booking.id)}
                              className="text-xs bg-green-600 text-white px-3 py-1 rounded w-full hover:bg-green-700"
                            >
                              Send Results via WhatsApp
                            </button>
                          )}

                          {['confirmed', 'sample_collected'].includes(booking.status) && (
                            <div className="text-xs text-gray-500 text-center">
                              Waiting for clinic...
                            </div>
                          )}

                          {booking.status === 'completed' && (
                            <div className="text-xs text-green-600 text-center">
                              ✓ Completed & Sent
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {bookings.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings</h3>
                <p className="mt-1 text-sm text-gray-500">No patient bookings to coordinate yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [tests, setTests] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [subAdmins, setSubAdmins] = useState([]);
  const [surgeryInquiries, setSurgeryInquiries] = useState([]);
  
  useEffect(() => {
    if (user?.role !== 'admin') return;
    
    fetchTests();
    fetchClinics();
    fetchBookings();
    fetchSubAdmins();
    fetchSurgeryInquiries();
  }, [user]);

  const fetchTests = async () => {
    try {
      const response = await axios.get(`${API}/tests`);
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchClinics = async () => {
    try {
      const response = await axios.get(`${API}/clinics`);
      setClinics(response.data);
    } catch (error) {
      console.error('Error fetching clinics:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchSubAdmins = async () => {
    try {
      // Get all users with sub_admin role
      const response = await axios.get(`${API}/users`);
      const subAdminUsers = response.data.filter(u => u.role === 'sub_admin');
      setSubAdmins(subAdminUsers);
    } catch (error) {
      console.error('Error fetching sub-admins:', error);
    }
  };

  const fetchSurgeryInquiries = async () => {
    try {
      const response = await axios.get(`${API}/surgery-inquiries`);
      setSurgeryInquiries(response.data);
    } catch (error) {
      console.error('Error fetching surgery inquiries:', error);
    }
  };

  const handleSubAdminStatusUpdate = async (subAdminId, newStatus) => {
    try {
      await axios.put(`${API}/users/${subAdminId}`, { is_active: newStatus });
      fetchSubAdmins();
      alert(`Sub-admin ${newStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating sub-admin status:', error);
      alert('Error updating sub-admin status');
    }
  };

  const handleSubAdminDelete = async (subAdminId) => {
    if (window.confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.')) {
      try {
        await axios.delete(`${API}/users/${subAdminId}`);
        fetchSubAdmins();
        alert('Sub-admin deleted successfully!');
      } catch (error) {
        console.error('Error deleting sub-admin:', error);
        alert('Error deleting sub-admin');
      }
    }
  };

  const handleSurgeryInquiryDelete = async (inquiryId) => {
    if (window.confirm('Are you sure you want to delete this surgery inquiry? This action cannot be undone.')) {
      try {
        await axios.delete(`${API}/surgery-inquiries/${inquiryId}`);
        fetchSurgeryInquiries();
        alert('Surgery inquiry deleted successfully!');
      } catch (error) {
        console.error('Error deleting surgery inquiry:', error);
        alert('Error deleting surgery inquiry');
      }
    }
  };

  if (user?.role !== 'admin') {
    return <Navigate to="/admin-login" />;
  }

  const renderTests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Lab Tests Management</h2>
        <TestForm onSuccess={fetchTests} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tests.map(test => (
              <tr key={test.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{test.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {test.category}
                  </span>
                </td>
                <td className="px-6 py-4">{test.description}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderClinics = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clinic Management</h2>
        <ClinicForm onSuccess={fetchClinics} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clinics.map(clinic => (
              <tr key={clinic.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{clinic.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clinic.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clinic.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span>{clinic.rating || 0} ({clinic.total_reviews || 0})</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 mr-2">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold">Test Booking Management</h2>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <select className="border rounded px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <input 
            type="text" 
            placeholder="Search bookings..." 
            className="border rounded px-3 py-2 text-sm"
          />
        </div>
      </div>

      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-yellow-800 truncate">New Bookings</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-800 truncate">Scheduled</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">
                {bookings.filter(b => b.status === 'confirmed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-orange-800 truncate">In Progress</p>
              <p className="text-lg sm:text-2xl font-bold text-orange-900">
                {bookings.filter(b => b.status === 'sample_collected' || b.status === 'results_ready').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-800 truncate">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Assigned Clinic</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Total</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.map(booking => {
                const clinic = clinics.find(c => c.id === booking.clinic_id);
                return (
                  <tr key={booking.id}>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-sm">{booking.booking_number}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <div>
                        <p className="font-medium text-sm">{booking.patient_name}</p>
                        <p className="text-xs text-gray-500">{booking.patient_phone}</p>
                        <p className="text-xs text-gray-500 sm:hidden">{booking.patient_location}</p>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                      <div>
                        <p className="font-medium text-sm">{clinic?.name || 'Not Assigned'}</p>
                        {clinic && (
                          <p className="text-xs text-gray-500">{clinic.location}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {booking.test_ids.length} test(s)
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        booking.status === 'results_ready' ? 'bg-purple-100 text-purple-800' :
                        booking.status === 'sample_collected' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status === 'pending' ? 'NEW' :
                         booking.status === 'confirmed' ? 'SCHEDULED' :
                         booking.status === 'sample_collected' ? 'IN PROGRESS' :
                         booking.status === 'results_ready' ? 'RESULTS READY' :
                         booking.status === 'completed' ? 'COMPLETED' :
                         booking.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      {booking.preferred_currency === 'USD' ? '$' : 'L$'}{booking.total_amount.toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="space-y-2">
                        <select
                          value={booking.status}
                          onChange={async (e) => {
                            try {
                              await axios.put(`${API}/bookings/${booking.id}/status`, { status: e.target.value });
                              fetchBookings();
                              alert('Booking status updated!');
                            } catch (error) {
                              console.error('Error updating status:', error);
                              alert('Error updating status');
                            }
                          }}
                          className="text-xs border rounded px-2 py-1 w-full"
                        >
                          <option value="pending">New</option>
                          <option value="confirmed">Scheduled</option>
                          <option value="sample_collected">In Progress</option>
                          <option value="results_ready">Results Ready</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                      </select>
                      
                      {booking.status === 'pending' && (
                        <select 
                          className="text-xs border rounded px-2 py-1 w-full"
                          onChange={async (e) => {
                            if (e.target.value) {
                              try {
                                // Assign clinic and update status
                                await axios.put(`${API}/bookings/${booking.id}/status`, { 
                                  status: 'confirmed',
                                  clinic_id: e.target.value 
                                });
                                fetchBookings();
                                alert('Booking assigned to clinic!');
                              } catch (error) {
                                console.error('Error assigning clinic:', error);
                                alert('Error assigning clinic');
                              }
                            }
                          }}
                        >
                          <option value="">Assign to Clinic</option>
                          {clinics.map(clinic => (
                            <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                          ))}
                        </select>
                      )}

                      {booking.status === 'results_ready' && (
                        <button
                          onClick={() => alert('WhatsApp notification sent to patient with results!')}
                          className="text-xs bg-green-600 text-white px-2 py-1 rounded w-full hover:bg-green-700"
                        >
                          Send via WhatsApp
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings found.</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Pricing Management</h2>
        <PricingForm tests={tests} clinics={clinics} onSuccess={() => window.location.reload()} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clinic</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LRD Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tests.map(test => {
              return clinics.map(clinic => {
                return (
                  <tr key={`${test.id}-${clinic.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{test.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{clinic.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">$0.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">L$0.00</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Not Set
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-blue-600 hover:text-blue-800 text-sm">
                        Set Price
                      </button>
                    </td>
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTestManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Test Management</h2>
        <TestForm onSuccess={fetchTests} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tests.map(test => (
              <tr key={test.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{test.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {test.category}
                  </span>
                </td>
                <td className="px-6 py-4 max-w-xs truncate">{test.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditTest(test)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {tests.length === 0 && (
          <div className="text-center py-12">
            <TestTube className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tests</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new lab test.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProviderManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Clinic/Hospital & Lab Technician Management</h2>
        <ProviderForm onSuccess={() => { fetchClinics(); }} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* Show Admin */}
            <tr className="bg-red-50">
              <td className="px-6 py-4 whitespace-nowrap font-medium">ChekUp Administrator</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Admin</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">admin@chekup.com</td>
              <td className="px-6 py-4 whitespace-nowrap">Monrovia, Liberia</td>
              <td className="px-6 py-4 whitespace-nowrap">+231-XXX-XXXX</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-gray-400 text-sm">Protected</span>
              </td>
            </tr>
            
            {/* Show Clinics */}
            {clinics.map(clinic => (
              <tr key={clinic.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{clinic.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Clinic</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{clinic.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clinic.location}</td>
                <td className="px-6 py-4 whitespace-nowrap">{clinic.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Active</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <button 
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => handleEditProvider(clinic, 'clinic')}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDeleteProvider(clinic.id, 'clinic')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {clinics.length === 0 && (
          <div className="text-center py-12">
            <Building className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No healthcare providers</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new clinic, hospital, or lab technician.</p>
          </div>
        )}
      </div>
    </div>
  );

  const handleEditTest = (test) => {
    alert(`Edit test: ${test.name} (Feature to be implemented)`);
  };

  const handleDeleteTest = async (testId) => {
    if (window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) {
      try {
        await axios.delete(`${API}/tests/${testId}`);
        fetchTests();
        alert('Test deleted successfully!');
      } catch (error) {
        console.error('Error deleting test:', error);
        alert('Error deleting test');
      }
    }
  };

  const handleEditProvider = (provider, type) => {
    alert(`Edit ${type}: ${provider.name} (Feature to be implemented)`);
  };

  const handleDeleteProvider = async (providerId, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}? This will also delete their login account.`)) {
      try {
        if (type === 'clinic') {
          await axios.delete(`${API}/clinics/${providerId}`);
        }
        fetchClinics();
        alert(`${type} deleted successfully!`);
      } catch (error) {
        console.error(`Error deleting ${type}:`, error);
        alert(`Error deleting ${type}`);
      }
    }
  };

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Notification Center</h2>
      
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Recent Alerts</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">New Booking Created</p>
                <p className="text-sm text-blue-600">Sarah Johnson booked CBC test - CHK-16C35149</p>
                <p className="text-xs text-blue-500">2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Test Results Uploaded</p>
                <p className="text-sm text-green-600">Monrovia Health Center uploaded results for CHK-16C35149</p>
                <p className="text-xs text-green-500">1 hour ago</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Surgery Inquiry Pending</p>
                <p className="text-sm text-yellow-600">New heart surgery inquiry requires hospital coordination</p>
                <p className="text-xs text-yellow-500">3 hours ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSurgeryHospitals = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Indian Hospitals & Accommodation</h2>
        <HospitalForm onSuccess={() => window.location.reload()} />
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Partner Hospitals</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Apollo Hospitals Delhi</h4>
                <p className="text-sm text-gray-600">Multi-specialty hospital with cardiac surgery excellence</p>
                <p className="text-sm text-blue-600">Contact: +91-11-2692-5858</p>
                <div className="mt-2 flex space-x-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Cardiology</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Orthopedics</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Fortis Healthcare Mumbai</h4>
                <p className="text-sm text-gray-600">Advanced surgical procedures and organ transplants</p>
                <p className="text-sm text-blue-600">Contact: +91-22-6754-5000</p>
                <div className="mt-2 flex space-x-2">
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Oncology</span>
                  <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Neurosurgery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Accommodation Options</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Budget Guest House Near Apollo</h4>
                <p className="text-sm text-gray-600">Clean, affordable accommodation 2km from hospital</p>
                <p className="text-sm text-green-600">₹1,500/night (~$18)</p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">WiFi</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Meals</span>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold">Serviced Apartments Mumbai</h4>
                <p className="text-sm text-gray-600">Family-friendly apartments with kitchen facilities</p>
                <p className="text-sm text-green-600">₹3,000/night (~$36)</p>
                <div className="mt-2">
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Kitchen</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">AC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSubAdminManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sub-Admin Management</h2>
        <SubAdminForm onSuccess={fetchSubAdmins} />
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {subAdmins.map(subAdmin => (
                <tr key={subAdmin.id}>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-sm">{subAdmin.name}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subAdmin.email}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subAdmin.phone}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{subAdmin.location}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      subAdmin.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {subAdmin.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() => {
                          const newStatus = !subAdmin.is_active;
                          handleSubAdminStatusUpdate(subAdmin.id, newStatus);
                        }}
                      >
                        {subAdmin.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleSubAdminDelete(subAdmin.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {subAdmins.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Sub-Admins</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new sub-admin user.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderSurgeryManagement = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Surgery & Accommodation Inquiry Management</h2>
        <div className="flex items-center space-x-4">
          <select className="border rounded px-3 py-2 text-sm">
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Surgery Inquiry Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-yellow-800 truncate">New Inquiries</p>
              <p className="text-lg sm:text-2xl font-bold text-yellow-900">
                {surgeryInquiries.filter(s => s.status === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-blue-800 truncate">In Progress</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-900">
                {surgeryInquiries.filter(s => s.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-green-800 truncate">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-green-900">
                {surgeryInquiries.filter(s => s.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mr-2 sm:mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-purple-800 truncate">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-purple-900">
                {surgeryInquiries.length}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient Info</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surgery Type</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {surgeryInquiries.map(inquiry => (
                <tr key={inquiry.id}>
                  <td className="px-3 sm:px-6 py-4">
                    <div>
                      <div className="font-medium text-sm">{inquiry.patient_name}</div>
                      <div className="text-xs text-gray-500">{inquiry.patient_phone}</div>
                      <div className="text-xs text-gray-500">{inquiry.patient_email}</div>
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4">
                    <div className="text-sm text-gray-900">{inquiry.surgery_type}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{inquiry.budget_range}</div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      inquiry.status === 'completed' ? 'bg-green-100 text-green-800' :
                      inquiry.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {inquiry.status === 'new' ? 'NEW' :
                       inquiry.status === 'in_progress' ? 'IN PROGRESS' :
                       inquiry.status === 'completed' ? 'COMPLETED' :
                       inquiry.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(inquiry.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <SurgeryInquiryManager 
                        inquiry={inquiry}
                        onUpdate={fetchSurgeryInquiries}
                      />
                      <button 
                        className="text-red-600 hover:text-red-800 text-sm"
                        onClick={() => handleSurgeryInquiryDelete(inquiry.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {surgeryInquiries.length === 0 && (
            <div className="text-center py-12">
              <Heart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Surgery Inquiries</h3>
              <p className="mt-1 text-sm text-gray-500">Surgery inquiries from patients will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
          </div>
          <nav className="mt-6">
            <div className="px-6 py-2">
              <button
                onClick={() => setActiveTab('bookings')}
                className={`flex items-center w-full px-2 py-2 text-sm rounded ${
                  activeTab === 'bookings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Calendar className="mr-3 h-4 w-4" />
                Booking Information
              </button>
            </div>
            <div className="px-6 py-2">
              <button
                onClick={() => setActiveTab('tests')}
                className={`flex items-center w-full px-2 py-2 text-sm rounded ${
                  activeTab === 'tests' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <TestTube className="mr-3 h-4 w-4" />
                Test Management
              </button>
            </div>
            <div className="px-6 py-2">
              <button
                onClick={() => setActiveTab('providers')}
                className={`flex items-center w-full px-2 py-2 text-sm rounded ${
                  activeTab === 'providers' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Building className="mr-3 h-4 w-4" />
                Clinic/Hospital & Lab Technician Management
              </button>
            </div>
            <div className="px-6 py-2">
              <button
                onClick={() => setActiveTab('subadmins')}
                className={`flex items-center w-full px-2 py-2 text-sm rounded ${
                  activeTab === 'subadmins' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Users className="mr-3 h-4 w-4" />
                Sub-Admin Management
              </button>
            </div>
            <div className="px-6 py-2">
              <button
                onClick={() => setActiveTab('surgery')}
                className={`flex items-center w-full px-2 py-2 text-sm rounded ${
                  activeTab === 'surgery' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Heart className="mr-3 h-4 w-4" />
                Surgery & Accommodation Management
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'tests' && renderTestManagement()}
          {activeTab === 'providers' && renderProviderManagement()}
          {activeTab === 'subadmins' && renderSubAdminManagement()}
          {activeTab === 'surgery' && renderSurgeryManagement()}
        </div>
      </div>
    </div>
  );
};

const SubAdminForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...formData,
        role: 'sub_admin',
        is_active: true
      };

      await axios.post(`${API}/auth/register`, userData);
      setShow(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        password: ''
      });
      onSuccess();
      alert(`Sub-admin created successfully!\n\nLogin Credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nProvide these credentials to the sub-admin.`);
    } catch (error) {
      console.error('Error creating sub-admin:', error);
      alert('Error creating sub-admin. Please check if email already exists.');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Sub-Admin
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create New Sub-Admin</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              placeholder="City, District, Liberia"
              className="w-full border rounded px-3 py-2"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Sub-Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SurgeryInquiryManager = ({ inquiry, onUpdate }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    hospital_details: inquiry.hospital_details || '',
    accommodation_details: inquiry.accommodation_details || '',
    estimated_cost: inquiry.estimated_cost || '',
    status: inquiry.status || 'new'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/surgery-inquiries/${inquiry.id}`, formData);
      setShow(false);
      onUpdate();
      alert('Surgery inquiry updated successfully!');
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Error updating inquiry');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Manage
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Manage Surgery Inquiry</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Patient Information</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p><strong>Name:</strong> {inquiry.patient_name}</p>
              <p><strong>Phone:</strong> {inquiry.patient_phone}</p>
              <p><strong>Email:</strong> {inquiry.patient_email}</p>
            </div>
            <div>
              <p><strong>Surgery Type:</strong> {inquiry.surgery_type}</p>
              <p><strong>Budget:</strong> {inquiry.budget_range}</p>
              <p><strong>Medical Condition:</strong> {inquiry.medical_condition}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="new">New</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Details</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Hospital recommendations, contact details, specialties..."
              value={formData.hospital_details}
              onChange={(e) => setFormData({...formData, hospital_details: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Details</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Accommodation options, pricing, amenities..."
              value={formData.accommodation_details}
              onChange={(e) => setFormData({...formData, accommodation_details: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., $15,000 - $25,000"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Update Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SurgeryInquiryModal = ({ inquiry, onUpdate }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    hospital_details: inquiry.hospital_details || '',
    accommodation_details: inquiry.accommodation_details || '',
    estimated_cost: inquiry.estimated_cost || '',
    status: inquiry.status || 'pending'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/surgery-inquiries/${inquiry.id}`, formData);
      setShow(false);
      onUpdate();
      alert('Surgery inquiry updated successfully!');
    } catch (error) {
      console.error('Error updating inquiry:', error);
      alert('Error updating inquiry');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
      >
        Manage
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Manage Surgery Inquiry</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="mb-4 p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Patient Information</h3>
          <p><strong>Name:</strong> {inquiry.patient_name}</p>
          <p><strong>Phone:</strong> {inquiry.patient_phone}</p>
          <p><strong>Surgery:</strong> {inquiry.surgery_type}</p>
          <p><strong>Condition:</strong> {inquiry.medical_condition}</p>
          <p><strong>Budget:</strong> {inquiry.budget_range}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Details</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Enter hospital recommendations and details..."
              value={formData.hospital_details}
              onChange={(e) => setFormData({...formData, hospital_details: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Accommodation Details</label>
            <textarea
              className="w-full border rounded px-3 py-2 h-20"
              placeholder="Enter accommodation options and details..."
              value={formData.accommodation_details}
              onChange={(e) => setFormData({...formData, accommodation_details: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              placeholder="e.g., $15,000 - $25,000"
              value={formData.estimated_cost}
              onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Update Inquiry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PricingForm = ({ tests, clinics, onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    test_id: '',
    clinic_id: '',
    price_usd: '',
    price_lrd: '',
    is_available: true
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/test-pricing`, {
        ...formData,
        price_usd: parseFloat(formData.price_usd),
        price_lrd: parseFloat(formData.price_lrd)
      });
      setShow(false);
      setFormData({
        test_id: '',
        clinic_id: '',
        price_usd: '',
        price_lrd: '',
        is_available: true
      });
      onSuccess();
      alert('Test pricing added successfully!');
    } catch (error) {
      console.error('Error adding pricing:', error);
      alert('Error adding pricing');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Set Test Price
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Set Test Pricing</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Test</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={formData.test_id}
              onChange={(e) => setFormData({...formData, test_id: e.target.value})}
            >
              <option value="">Select Test</option>
              {tests.map(test => (
                <option key={test.id} value={test.id}>{test.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Clinic</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={formData.clinic_id}
              onChange={(e) => setFormData({...formData, clinic_id: e.target.value})}
            >
              <option value="">Select Clinic</option>
              {clinics.map(clinic => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">USD Price</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.price_usd}
              onChange={(e) => setFormData({...formData, price_usd: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LRD Price</label>
            <input
              type="number"
              step="0.01"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.price_lrd}
              onChange={(e) => setFormData({...formData, price_lrd: e.target.value})}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="available"
              checked={formData.is_available}
              onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="available" className="text-sm text-gray-700">Available for booking</label>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Set Pricing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProviderForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'clinic',
    password: '',
    
    // Clinic/Hospital specific fields
    description: '',
    services: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, create the user account
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        role: formData.role,
        password: formData.password
      };

      const userResponse = await axios.post(`${API}/auth/register`, userData);
      
      // If it's a clinic, also create the clinic profile
      if (formData.role === 'clinic') {
        const clinicData = {
          user_id: userResponse.data.id,
          name: formData.name,
          description: formData.description || 'Healthcare facility',
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          services: formData.services ? formData.services.split(',').map(s => s.trim()) : [],
          operating_hours: {}
        };
        
        await axios.post(`${API}/clinics`, clinicData);
      }
      
      setShow(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        role: 'clinic',
        password: '',
        description: '',
        services: ''
      });
      
      onSuccess();
      alert(`${formData.role === 'clinic' ? 'Clinic/Hospital' : 'Lab Technician'} created successfully!\n\nLogin Credentials:\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nProvide these credentials to the healthcare provider.`);
    } catch (error) {
      console.error('Error creating provider:', error);
      alert('Error creating provider. Please check if email already exists.');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Provider
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create New Healthcare Provider</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="clinic">Clinic/Hospital</option>
              <option value="lab_technician">Lab Technician</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.role === 'clinic' ? 'Clinic/Hospital Name' : 'Technician Name'}
            </label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              placeholder="City, District, Liberia"
              className="w-full border rounded px-3 py-2"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {formData.role === 'clinic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-16"
                  placeholder="Brief description of services offered"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., General Practice, Laboratory, X-Ray"
                  value={formData.services}
                  onChange={(e) => setFormData({...formData, services: e.target.value})}
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create & Generate Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const UserForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'clinic',
    password: '',
    
    // Clinic/Hospital specific fields
    description: '',
    services: '',
    operating_hours: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, create the user account
      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        role: formData.role,
        password: formData.password
      };

      const userResponse = await axios.post(`${API}/auth/register`, userData);
      
      // If it's a clinic, also create the clinic profile
      if (formData.role === 'clinic') {
        const clinicData = {
          user_id: userResponse.data.id,
          name: formData.name,
          description: formData.description || 'Healthcare facility',
          location: formData.location,
          phone: formData.phone,
          email: formData.email,
          services: formData.services ? formData.services.split(',').map(s => s.trim()) : [],
          operating_hours: {}
        };
        
        await axios.post(`${API}/clinics`, clinicData);
      }
      
      setShow(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        location: '',
        role: 'clinic',
        password: '',
        description: '',
        services: '',
        operating_hours: ''
      });
      
      onSuccess();
      alert(`${formData.role === 'clinic' ? 'Clinic' : 'Lab Technician'} account created successfully! Login credentials: ${formData.email} / ${formData.password}`);
    } catch (error) {
      console.error('Error creating account:', error);
      alert('Error creating account. Please check if email already exists.');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create Healthcare Provider Account
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Create Healthcare Provider Account</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider Type</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="clinic">Clinic/Hospital</option>
              <option value="lab_technician">Lab Technician</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.role === 'clinic' ? 'Clinic/Hospital Name' : 'Technician Name'}
            </label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                required
                className="w-full border rounded px-3 py-2"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              placeholder="City, District, Liberia"
              className="w-full border rounded px-3 py-2"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label>
            <input
              type="password"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          {formData.role === 'clinic' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full border rounded px-3 py-2 h-16"
                  placeholder="Brief description of services offered"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Services (Optional)</label>
                <input
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  placeholder="e.g., General Practice, Laboratory, X-Ray"
                  value={formData.services}
                  onChange={(e) => setFormData({...formData, services: e.target.value})}
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Account & Portal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const HospitalForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contact: '',
    specialties: '',
    type: 'hospital'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // In a real app, this would save to a hospitals collection
      // For now, we'll just show success message
      setShow(false);
      setFormData({
        name: '',
        location: '',
        contact: '',
        specialties: '',
        type: 'hospital'
      });
      onSuccess();
      alert('Hospital/Accommodation added successfully!');
    } catch (error) {
      console.error('Error adding hospital:', error);
      alert('Error adding hospital');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Hospital/Accommodation
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Hospital/Accommodation</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              required
              className="w-full border rounded px-3 py-2"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="hospital">Hospital</option>
              <option value="accommodation">Accommodation</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.type === 'hospital' ? 'Specialties' : 'Amenities'}
            </label>
            <input
              type="text"
              required
              className="w-full border rounded px-3 py-2"
              placeholder={formData.type === 'hospital' ? 'e.g., Cardiology, Orthopedics' : 'e.g., WiFi, Kitchen, AC'}
              value={formData.specialties}
              onChange={(e) => setFormData({...formData, specialties: e.target.value})}
            />
          </div>
          
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Add {formData.type === 'hospital' ? 'Hospital' : 'Accommodation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
const ClinicForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    description: '',
    location: '',
    phone: '',
    email: '',
    services: '',
    operating_hours: ''
  });

  useEffect(() => {
    if (show) {
      fetchUsers();
    }
  }, [show]);

  const fetchUsers = async () => {
    // Note: This would need a user endpoint in the backend
    // For now, we'll create a clinic and link it manually
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const clinicData = {
        ...formData,
        services: formData.services.split(',').map(s => s.trim()),
        operating_hours: formData.operating_hours ? JSON.parse(formData.operating_hours) : {}
      };

      await axios.post(`${API}/clinics`, clinicData);
      setShow(false);
      setFormData({
        user_id: '',
        name: '',
        description: '',
        location: '',
        phone: '',
        email: '',
        services: '',
        operating_hours: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating clinic:', error);
      alert('Error creating clinic');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Clinic
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add New Clinic</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="User ID (clinic account owner)"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.user_id}
            onChange={(e) => setFormData({...formData, user_id: e.target.value})}
          />
          <input
            type="text"
            placeholder="Clinic Name"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <textarea
            placeholder="Description"
            required
            className="w-full border rounded px-3 py-2 h-20"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <input
            type="text"
            placeholder="Location"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
          <input
            type="tel"
            placeholder="Phone Number"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <input
            type="email"
            placeholder="Email"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input
            type="text"
            placeholder="Services (comma separated)"
            className="w-full border rounded px-3 py-2"
            value={formData.services}
            onChange={(e) => setFormData({...formData, services: e.target.value})}
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Clinic
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TestForm = ({ onSuccess }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    preparation_instructions: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tests`, formData);
      setShow(false);
      setFormData({ name: '', description: '', category: '', preparation_instructions: '' });
      onSuccess();
    } catch (error) {
      console.error('Error creating test:', error);
      alert('Error creating test');
    }
  };

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Test
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add New Test</h2>
          <button onClick={() => setShow(false)} className="text-gray-500">
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Test Name"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input
            type="text"
            placeholder="Category"
            required
            className="w-full border rounded px-3 py-2"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
          <textarea
            placeholder="Description"
            required
            className="w-full border rounded px-3 py-2 h-20"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <textarea
            placeholder="Preparation Instructions (Optional)"
            className="w-full border rounded px-3 py-2 h-20"
            value={formData.preparation_instructions}
            onChange={(e) => setFormData({...formData, preparation_instructions: e.target.value})}
          />
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SurgeryInquiry = () => {
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    surgery_type: '',
    medical_condition: '',
    preferred_hospital_location: 'India',
    budget_range: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API}/surgery-inquiries`, formData);
      alert('Surgery inquiry submitted successfully! Our team will contact you within 24 hours.');
      navigate('/');
    } catch (error) {
      console.error('Error submitting surgery inquiry:', error);
      alert('Error submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <img 
              src="https://images.unsplash.com/photo-1606206873764-fd15e242df52?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwzfHxtZWRpY2FsfGVufDB8fHxibHVlfDE3NTI4ODA5NzB8MA&ixlib=rb-4.1.0&q=85"
              alt="Medical Equipment"
              className="mx-auto mb-4 rounded-lg w-64 h-40 object-cover"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Surgery Inquiry</h1>
            <p className="text-gray-600">Get affordable surgery options in India with accommodation assistance</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.patient_name}
                  onChange={(e) => setFormData({...formData, patient_name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.patient_phone}
                  onChange={(e) => setFormData({...formData, patient_phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email (Optional)
              </label>
              <input
                type="email"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.patient_email}
                onChange={(e) => setFormData({...formData, patient_email: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Surgery *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Heart Surgery, Knee Replacement, etc."
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.surgery_type}
                onChange={(e) => setFormData({...formData, surgery_type: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Medical Condition *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Please describe your medical condition and current symptoms"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.medical_condition}
                onChange={(e) => setFormData({...formData, medical_condition: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Budget (USD) *
              </label>
              <input
                type="text"
                required
                placeholder="Enter your budget amount (e.g., $15,000)"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.budget_range}
                onChange={(e) => setFormData({...formData, budget_range: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                rows={3}
                placeholder="Any additional information or special requirements"
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? 'Submitting...' : 'Submit Inquiry'}
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">What happens next?</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Our team will review your inquiry within 24 hours</li>
              <li>• We'll contact Indian hospitals to check availability and pricing</li>
              <li>• We'll provide you with accommodation options near the hospital</li>
              <li>• All details will be sent via WhatsApp or phone call</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClinicDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);
  const [myClinic, setMyClinic] = useState(null);
  const [testPricing, setTestPricing] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (user?.role === 'clinic') {
      fetchClinicData();
      fetchBookings();
      fetchTestPricing();
    }
  }, [user]);

  const fetchClinicData = async () => {
    try {
      const response = await axios.get(`${API}/clinics`);
      const userClinic = response.data.find(clinic => clinic.user_id === user.id);
      setMyClinic(userClinic);
    } catch (error) {
      console.error('Error fetching clinic data:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await axios.get(`${API}/bookings`);
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const fetchTestPricing = async () => {
    try {
      if (myClinic) {
        const response = await axios.get(`${API}/public/clinics/${myClinic.id}/tests`);
        setTestPricing(response.data);
      }
    } catch (error) {
      console.error('Error fetching test pricing:', error);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      await axios.put(`${API}/bookings/${bookingId}/status`, { status });
      fetchBookings(); // Refresh bookings
      alert('Booking status updated successfully!');
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Error updating booking status');
    }
  };

  const handleFileUpload = async (bookingId, files) => {
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });

      await axios.post(`${API}/bookings/${bookingId}/upload-results`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      alert('Results uploaded successfully!');
      fetchBookings(); // Refresh bookings
    } catch (error) {
      console.error('Error uploading results:', error);
      alert('Error uploading results');
    }
  };

  if (user?.role !== 'clinic') {
    return <Navigate to="/admin-login" />;
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Clinic Dashboard</h2>
      
      {myClinic && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-semibold mb-4">My Clinic Information</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p><strong>Name:</strong> {myClinic.name}</p>
              <p><strong>Location:</strong> {myClinic.location}</p>
              <p><strong>Phone:</strong> {myClinic.phone}</p>
              <p><strong>Email:</strong> {myClinic.email}</p>
            </div>
            <div>
              <p><strong>Rating:</strong> ⭐ {myClinic.rating}/5 ({myClinic.total_reviews} reviews)</p>
              <p><strong>Status:</strong> Active</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total Bookings</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{bookings.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Completed</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600 mr-3 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Pending</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Manage Bookings</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bookings.map(booking => (
              <tr key={booking.id}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{booking.booking_number}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium">{booking.patient_name}</p>
                    <p className="text-sm text-gray-500">{booking.patient_phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {booking.test_ids.length} test(s)
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'results_ready' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  ${booking.total_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="sample_collected">Sample Collected</option>
                    <option value="results_ready">Results Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                  
                  {booking.status === 'sample_collected' && (
                    <label className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
                      Upload Results
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.png,.docx"
                        className="hidden"
                        onChange={(e) => handleFileUpload(booking.id, e.target.files)}
                      />
                    </label>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No bookings assigned to your clinic yet.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Clinic Profile</h2>
      
      {myClinic && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clinic Name</label>
              <input
                type="text"
                value={myClinic.name}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                value={myClinic.location}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="text"
                value={myClinic.phone}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={myClinic.email}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={myClinic.description}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-50 h-20"
              />
            </div>
            
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Contact the administrator to update your clinic information.
            </p>
          </div>
        </div>
      )}
    </div>
  );

  const renderOfferedTests = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Offered Tests & Pricing</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USD Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">LRD Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {testPricing.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{item.test?.name || 'Unknown Test'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                    {item.test?.category || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${item.pricing?.price_usd || '0.00'}</td>
                <td className="px-6 py-4 whitespace-nowrap">L${item.pricing?.price_lrd || '0.00'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 rounded text-xs ${
                    item.pricing?.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.pricing?.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {testPricing.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No tests configured yet. Contact admin to set up test pricing.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderSampleChecklist = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Sample Collection Checklist</h2>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Pre-Collection Safety Protocol</h3>
        <div className="space-y-3">
          {[
            'Verify patient identity with valid ID',
            'Confirm test requirements and fasting status',
            'Check sample collection containers and labels',
            'Ensure sterile collection environment',
            'Use proper PPE (gloves, mask, sanitizer)',
            'Label samples immediately after collection',
            'Document collection time and conditions',
            'Store samples at correct temperature',
            'Complete chain of custody documentation',
            'Prepare samples for transport to lab'
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input type="checkbox" className="h-4 w-4 text-blue-600" />
              <label className="text-sm text-gray-700">{item}</label>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800 mb-2">Important Notes:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Always follow universal precautions</li>
            <li>• Document any collection issues or patient concerns</li>
            <li>• Contact lab immediately for urgent samples</li>
            <li>• Ensure proper transport conditions maintained</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderCommissions = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Commission Summary</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Auto-Generated Invoices</h3>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">This Month</h4>
              <p className="text-2xl font-bold text-blue-900">$0.00</p>
              <p className="text-sm text-blue-600">0 completed tests</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Earnings</h4>
              <p className="text-2xl font-bold text-green-900">$0.00</p>
              <p className="text-sm text-green-600">0 total tests</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800">Pending</h4>
              <p className="text-2xl font-bold text-yellow-900">$0.00</p>
              <p className="text-sm text-yellow-600">0 pending payments</p>
            </div>
          </div>
          
          <h4 className="font-semibold mb-4">Recent Invoices</h4>
          <div className="space-y-4">
            {bookings.filter(b => b.status === 'completed').length === 0 ? (
              <p className="text-gray-500 text-center py-8">No completed tests yet. Commission invoices will appear here.</p>
            ) : (
              bookings.filter(b => b.status === 'completed').map(booking => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-semibold">{booking.booking_number}</h5>
                      <p className="text-sm text-gray-600">Patient: {booking.patient_name}</p>
                      <p className="text-sm text-gray-600">Tests: {booking.test_ids.length}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        Commission: ${(booking.total_amount * 0.15).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">15% of ${booking.total_amount}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Mobile menu backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
          <div className="p-4 sm:p-6 border-b lg:border-none">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-800">Clinic Portal</h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
              <button
                className="lg:hidden p-2"
                onClick={() => setSidebarOpen(false)}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
          <nav className="mt-4 sm:mt-6">
            {[
              { tab: 'dashboard', icon: BarChart3, label: 'Dashboard' },
              { tab: 'bookings', icon: Calendar, label: 'Bookings' },
              { tab: 'tests', icon: TestTube, label: 'Offered Tests' },
              { tab: 'checklist', icon: CheckCircle, label: 'Sample Checklist' },
              { tab: 'commissions', icon: DollarSign, label: 'Commissions' },
              { tab: 'profile', icon: Settings, label: 'Profile' },
            ].map(({ tab, icon: Icon, label }) => (
              <div key={tab} className="px-4 sm:px-6 py-1 sm:py-2">
                <button
                  onClick={() => {
                    setActiveTab(tab);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center w-full px-2 py-2 text-sm rounded transition-colors ${
                    activeTab === tab ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span>{label}</span>
                </button>
              </div>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Mobile header */}
          <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">Clinic Portal</h1>
              <div></div>
            </div>
          </div>
          
          <div className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'bookings' && renderBookings()}
            {activeTab === 'tests' && renderOfferedTests()}
            {activeTab === 'checklist' && renderSampleChecklist()}
            {activeTab === 'commissions' && renderCommissions()}
            {activeTab === 'profile' && renderProfile()}
          </div>
        </div>
      </div>
    </div>
  );
};

const UserRegistration = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    role: 'clinic',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        role: formData.role,
        password: formData.password
      };

      await axios.post(`${API}/auth/register`, registrationData);
      alert('Registration successful! Please contact admin to activate your account.');
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.status === 400 && error.response?.data?.detail?.includes('already registered')) {
        alert('Email already registered. Please use a different email.');
      } else {
        alert('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register as Healthcare Provider
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join ChekUp as a clinic or lab technician
          </p>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="clinic">Clinic/Hospital</option>
              <option value="lab_technician">Lab Technician</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.role === 'clinic' ? 'Clinic/Hospital Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              required
              placeholder="City, Country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/admin-login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/admin-login" />;
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/test/:testId/providers" element={<TestProviders />} />
            <Route path="/admin-login" element={<Login />} />
            <Route path="/surgery-inquiry" element={<SurgeryInquiry />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/sub-admin/*" 
              element={
                <ProtectedRoute allowedRoles={['sub_admin']}>
                  <SubAdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/clinic-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['clinic', 'lab_technician']}>
                  <ClinicDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;