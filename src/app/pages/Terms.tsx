import { Link } from 'react-router';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function Terms() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last updated: March 23, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 lg:p-12 border border-gray-100">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-6">
              By accessing and using AI Assignment Agent, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Use License</h2>
            <p className="text-gray-600 mb-6">
              Permission is granted to temporarily use AI Assignment Agent for personal, non-commercial
              educational purposes. This is the grant of a license, not a transfer of title.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-600 mb-6">
              You are responsible for safeguarding the password that you use to access the service and
              for any activities or actions under your password.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Intellectual Property</h2>
            <p className="text-gray-600 mb-6">
              The service and its original content, features, and functionality are and will remain the
              exclusive property of AI Assignment Agent and its licensors.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Disclaimer</h2>
            <p className="text-gray-600 mb-6">
              Your use of the service is at your sole risk. The service is provided on an "AS IS" and
              "AS AVAILABLE" basis without any warranties of any kind.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Information</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms, please contact us at support@aiassignment.com
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
