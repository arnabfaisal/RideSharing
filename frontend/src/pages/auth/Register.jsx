import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { post } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';

export default function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'passenger',
    vehicle: {
      make: '',
      model: '',
      plateNumber: '',
      color: '',
      year: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVehicleChange = (e) => {
    setFormData({
      ...formData,
      vehicle: {
        ...formData.vehicle,
        [e.target.name]: e.target.value,
      },
    });
  };

  const validateEmail = (email) => {
    const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu$/i;
    return eduRegex.test(email);
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!validateEmail(formData.email)) {
      setError('Please use a valid .edu email address');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const body = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        roles: formData.role,
      };

      if (formData.role === 'driver' || formData.role === 'both') {
        body.vehicle = formData.vehicle;
      }

      const res = await post('/api/auth/register', body);
      
      if (res.success) {
        setSuccess('Registration successful! Please check your email for verification.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Use your university email (.edu) to get started
        </p>
        
        {/* Progress Steps */}
        <div className="mt-8 flex justify-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              1
            </div>
            <div className={`w-16 h-1 mx-2 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              2
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <Card>
          {error && <Alert type="error" message={error} />}
          {success && <Alert type="success" message={success} />}

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  
                  <Input
                    label="University Email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john.doe@university.edu"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                  />
                  
                  <Input
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                  />
                </div>

                <div className="flex justify-end">
                  <Button type="button" onClick={handleNext}>
                    Continue
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I want to register as:
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { value: 'passenger', label: 'Passenger', desc: 'Book rides & send items' },
                      { value: 'driver', label: 'Driver', desc: 'Give rides & earn money' },
                      { value: 'both', label: 'Both', desc: 'Switch between roles' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          formData.role === option.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-300'
                        }`}
                        onClick={() => setFormData({ ...formData, role: option.value })}
                      >
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{option.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {(formData.role === 'driver' || formData.role === 'both') && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Make"
                        name="make"
                        value={formData.vehicle.make}
                        onChange={handleVehicleChange}
                        placeholder="Toyota"
                      />
                      <Input
                        label="Model"
                        name="model"
                        value={formData.vehicle.model}
                        onChange={handleVehicleChange}
                        placeholder="Camry"
                      />
                      <Input
                        label="Plate Number"
                        name="plateNumber"
                        value={formData.vehicle.plateNumber}
                        onChange={handleVehicleChange}
                        placeholder="ABC-123"
                      />
                      <Input
                        label="Color"
                        name="color"
                        value={formData.vehicle.color}
                        onChange={handleVehicleChange}
                        placeholder="Blue"
                      />
                      <Input
                        label="Year"
                        name="year"
                        type="number"
                        value={formData.vehicle.year}
                        onChange={handleVehicleChange}
                        placeholder="2020"
                        min="2000"
                        max="2025"
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-6 border-t">
                  <Button type="button" variant="secondary" onClick={handleBack}>
                    Back
                  </Button>
                  <Button type="submit" loading={loading} disabled={loading}>
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}