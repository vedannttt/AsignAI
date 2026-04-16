import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Sparkles, Mail, Lock, User, Building, BookOpen, Eye, EyeOff, CheckCircle, GraduationCap, Users } from 'lucide-react';

export function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'role' | 'details' | 'confirm'>('role');
  const [formData, setFormData] = useState({
    role: '' as 'teacher' | 'student' | string,
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    institution: '',
    department: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.role) newErrors.role = 'Please select a role';
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!formData.email.includes('@')) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (formData.role === 'teacher') {
      if (!formData.institution) newErrors.institution = 'Institution name is required';
      if (!formData.department) newErrors.department = 'Department is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRoleSelect = (role: 'teacher' | 'student') => {
    setFormData({ ...formData, role });
    setErrors({ ...errors, role: '' });
  };

  const handleNextToDetails = () => {
    if (!formData.role) {
      setErrors({ role: 'Please select a role to continue' });
      return;
    }
    setCurrentStep('details');
  };

  const handleNextToConfirm = () => {
    if (!validateForm()) return;
    setCurrentStep('confirm');
  };

  const handleSubmit = () => {
    setIsLoading(true);

    fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        institution: formData.institution,
        department: formData.department,
      })
    })
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
        setIsLoading(false);
        if (status === 201) {
          localStorage.setItem('user', JSON.stringify(data.user));
          navigate('/dashboard');
        } else {
          setErrors({ email: data.error || 'Sign up failed' });
        }
      })
      .catch(err => {
        console.error(err);
        try {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          if (users.find((u: any) => u.email === formData.email)) {
            setIsLoading(false);
            setErrors({ email: 'Email already exists' });
            return;
          }
          
          let userInitials = 'U';
          if (formData.fullName) {
             const parts = formData.fullName.split(' ');
             userInitials = parts.map(n => n[0]).join('').substring(0,2).toUpperCase();
          }
          
          const newUser = {
            id: Date.now().toString(),
            name: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            institution: formData.institution,
            department: formData.department,
            avatar: userInitials,
            createdAt: new Date().toISOString()
          };
          
          users.push(newUser);
          localStorage.setItem('users', JSON.stringify(users));
          
          const { password: _, ...userWithoutPassword } = newUser;
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          setIsLoading(false);
          navigate('/dashboard');
        } catch(fallbackErr) {
          setIsLoading(false);
          setErrors({ email: 'Network error. Is the backend running?' });
        }
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600">
            {currentStep === 'role' && 'Choose your role to get started'}
            {currentStep === 'details' && `Sign up as ${formData.role === 'teacher' ? 'a Teacher' : 'a Student'}`}
            {currentStep === 'confirm' && 'Confirm your details'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 rounded-full transition-all ${currentStep === 'role' ? 'w-12 bg-purple-600' : 'w-8 bg-purple-600'}`} />
            <div className={`h-2 rounded-full transition-all ${currentStep === 'details' ? 'w-12 bg-purple-600' : currentStep === 'confirm' ? 'w-8 bg-purple-600' : 'w-8 bg-gray-300'}`} />
            <div className={`h-2 rounded-full transition-all ${currentStep === 'confirm' ? 'w-12 bg-purple-600' : 'w-8 bg-gray-300'}`} />
          </div>
          <div className="flex justify-center gap-8 mt-2">
            <span className={`text-xs ${currentStep === 'role' ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>Role</span>
            <span className={`text-xs ${currentStep === 'details' ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>Details</span>
            <span className={`text-xs ${currentStep === 'confirm' ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>Confirm</span>
          </div>
        </div>

        {/* Sign Up Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
          {/* STEP 1: Role Selection */}
          {currentStep === 'role' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  I am joining as a...
                </h3>
                
                {errors.email && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-sm text-red-800">{errors.email}</p>
                  </div>
                )}
                {errors.role && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs">!</span>
                    </div>
                    <p className="text-sm text-red-800">{errors.role}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Teacher Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('teacher')}
                    className={`relative p-6 border-2 rounded-2xl transition-all duration-300 text-left group ${
                      formData.role === 'teacher'
                        ? 'border-purple-600 bg-purple-50 shadow-lg shadow-purple-500/20'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                    }`}
                  >
                    {formData.role === 'teacher' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${
                      formData.role === 'teacher' 
                        ? 'bg-purple-600' 
                        : 'bg-purple-100 group-hover:bg-purple-200'
                    }`}>
                      <GraduationCap className={`w-7 h-7 ${
                        formData.role === 'teacher' ? 'text-white' : 'text-purple-600'
                      }`} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Teacher</h4>
                    <p className="text-sm text-gray-600">
                      Create assignments, evaluate student work, and provide feedback
                    </p>
                  </button>

                  {/* Student Card */}
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`relative p-6 border-2 rounded-2xl transition-all duration-300 text-left group ${
                      formData.role === 'student'
                        ? 'border-indigo-600 bg-indigo-50 shadow-lg shadow-indigo-500/20'
                        : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                    }`}
                  >
                    {formData.role === 'student' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-all ${
                      formData.role === 'student' 
                        ? 'bg-indigo-600' 
                        : 'bg-indigo-100 group-hover:bg-indigo-200'
                    }`}>
                      <Users className={`w-7 h-7 ${
                        formData.role === 'student' ? 'text-white' : 'text-indigo-600'
                      }`} />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Student</h4>
                    <p className="text-sm text-gray-600">
                      Submit assignments, view feedback, and track your progress
                    </p>
                  </button>
                </div>
              </div>

              <button
                onClick={handleNextToDetails}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2: Details Form */}
          {currentStep === 'details' && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Role Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                formData.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                {formData.role === 'teacher' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                <span className="text-sm font-medium capitalize">{formData.role}</span>
                <button
                  onClick={() => setCurrentStep('role')}
                  className="ml-1 text-xs underline hover:no-underline"
                >
                  Change
                </button>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      setErrors({ ...errors, fullName: '' });
                    }}
                    placeholder="John Doe"
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: '' });
                    }}
                    placeholder={formData.role === 'teacher' ? 'you@institution.edu' : 'you@email.com'}
                    className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                        setErrors({ ...errors, password: '' });
                      }}
                      placeholder="Min. 6 characters"
                      className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                        errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600 mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value });
                        setErrors({ ...errors, confirmPassword: '' });
                      }}
                      placeholder="Re-enter password"
                      className={`w-full pl-11 pr-12 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                        errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Teacher-only fields */}
              {formData.role === 'teacher' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Institution Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => {
                          setFormData({ ...formData, institution: e.target.value });
                          setErrors({ ...errors, institution: '' });
                        }}
                        placeholder="University Name"
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                          errors.institution ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.institution && (
                      <p className="text-xs text-red-600 mt-1">{errors.institution}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department / Subject
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => {
                          setFormData({ ...formData, department: e.target.value });
                          setErrors({ ...errors, department: '' });
                        }}
                        placeholder="Computer Science"
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all ${
                          errors.department ? 'border-red-300 bg-red-50' : 'border-gray-200'
                        }`}
                      />
                    </div>
                    {errors.department && (
                      <p className="text-xs text-red-600 mt-1">{errors.department}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setCurrentStep('role')}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleNextToConfirm}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg shadow-purple-500/30"
                >
                  Review Details
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {currentStep === 'confirm' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="text-center mb-6">
                <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  formData.role === 'teacher' ? 'bg-purple-100' : 'bg-indigo-100'
                }`}>
                  {formData.role === 'teacher' ? (
                    <GraduationCap className={`w-10 h-10 ${formData.role === 'teacher' ? 'text-purple-600' : 'text-indigo-600'}`} />
                  ) : (
                    <Users className={`w-10 h-10 ${formData.role === 'teacher' ? 'text-purple-600' : 'text-indigo-600'}`} />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Confirm Your Account
                </h3>
                <p className="text-gray-600">
                  Please review your information before creating your account
                </p>
              </div>

              {errors.email && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">!</span>
                  </div>
                  <p className="text-sm text-red-800">{errors.email}</p>
                </div>
              )}

              {/* Confirmation Details */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Account Type</span>
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    formData.role === 'teacher' ? 'bg-purple-600 text-white' : 'bg-indigo-600 text-white'
                  }`}>
                    {formData.role === 'teacher' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    <span className="text-sm font-medium capitalize">{formData.role}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Full Name</span>
                  <span className="text-sm font-medium text-gray-900">{formData.fullName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  <span className="text-sm font-medium text-gray-900">{formData.email}</span>
                </div>

                {formData.role === 'teacher' && formData.institution && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Institution</span>
                      <span className="text-sm font-medium text-gray-900">{formData.institution}</span>
                    </div>
                    
                    {formData.department && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Department</span>
                        <span className="text-sm font-medium text-gray-900">{formData.department}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('details')}
                  disabled={isLoading}
                  className="flex-1 py-3.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  Edit Details
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create {formData.role === 'teacher' ? 'Teacher' : 'Student'} Account
                      <CheckCircle className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}