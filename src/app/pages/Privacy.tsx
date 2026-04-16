import { Link } from 'react-router';
import { Sparkles, ArrowLeft } from 'lucide-react';

export function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-purple-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-gray-600">Last updated: March 23, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 lg:p-12 border border-gray-100">
          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-600 mb-6">
              We collect information you provide directly to us, such as your name, email address,
              institution name, and department when you create an account.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-600 mb-6">
              We use the information we collect to provide, maintain, and improve our services, to
              communicate with you, and to protect our users.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Information Sharing</h2>
            <p className="text-gray-600 mb-6">
              We do not share your personal information with third parties except as described in this
              policy or with your consent.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-6">
              We take reasonable measures to help protect your personal information from loss, theft,
              misuse, and unauthorized access, disclosure, alteration, and destruction.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You have the right to access, update, or delete your personal information at any time.
              You can do this by accessing your account settings.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Cookies</h2>
            <p className="text-gray-600 mb-6">
              We use cookies and similar tracking technologies to track activity on our service and
              hold certain information to improve your experience.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
            <p className="text-gray-600 mb-6">
              We may update our Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
            <p className="text-gray-600 mb-6">
              If you have any questions about this Privacy Policy, please contact us at privacy@aiassignment.com
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
