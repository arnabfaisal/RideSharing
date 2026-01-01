import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import AppealModal from '../../components/appeals/AppealModal';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';
  const [suspensionInfo, setSuspensionInfo] = useState(null);
  const [showAppeal, setShowAppeal] = useState(false);
  const formatSuspensionDate = (date) => {
  if (!date) return 'Until further notice';
  const d = new Date(date);
  return isNaN(d.getTime()) ? 'Until further notice' : d.toLocaleString();
};

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    }  
   catch (err) {
  // err IS the backend response now
  const data = err // ✅ CORRECT
    

  // 🚫 Suspended account
  if (data?.message === 'Account temporarily suspended') {
    setSuspensionInfo(data);
    setError('Account temporarily suspended');
  }else if (data?.message === 'Account permanently banned') {
    setError('Account permanently banned');
  }else {
    setError(data?.message || 'Login failed. Please check your credentials.');
  }
}
 finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your university email (.edu) to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit}>
{error && (
  <Alert
    type="error"
    message={
      error === 'Account temporarily suspended'
        ? suspensionInfo?.suspendedUntil
          ? `Your account is suspended until ${formatSuspensionDate(
              suspensionInfo.suspendedUntil
            )}`
          : 'Your account is suspended'
        : error
    }
  />
)}



{suspensionInfo && (suspensionInfo.appealCount ?? 0) < 2 && (
  <div className="mt-3 text-center">
    <p className="text-sm text-gray-600 mb-2">
      Suspended until:{' '}
      <strong>
        {formatSuspensionDate(suspensionInfo.suspendedUntil)}
      </strong>
    </p>

    <Button
      type="button"
      className="bg-orange-600 hover:bg-orange-700 text-white"
      onClick={() => setShowAppeal(true)}
    >
      Appeal Suspension
    </Button>
  </div>
)}



            <Input
              label="Email address"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@university.edu"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Don't have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link to="/register">
                <Button variant="secondary" className="w-full">
                  Create new account
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
      {/* 🔔 Appeal Modal */}
      {showAppeal && (
  <AppealModal
    email={formData.email}
    onClose={() => setShowAppeal(false)}
  />
)}

    </div>
    
  );
}
