import { createBrowserRouter, Navigate } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import { DashboardHome } from "./pages/DashboardHome";
import { AssignmentGenerator } from "./pages/AssignmentGenerator";
import { AnswerKeyGenerator } from "./pages/AnswerKeyGenerator";
import { UploadAssignment } from "./pages/UploadAssignment";
import { Evaluation } from "./pages/Evaluation";
import { PlagiarismChecker } from "./pages/PlagiarismChecker";
import { Feedback } from "./pages/Feedback";
import { CopyDetection } from "./pages/CopyDetection";
import { ProfileSettings } from "./pages/ProfileSettings";
import { StudentSubmissions } from "./pages/StudentSubmissions";
import { DoubtSolver } from "./pages/DoubtSolver";
import { ClassInsights } from "./pages/ClassInsights";
import { RubricBuilder } from "./pages/RubricBuilder";
import { SignIn } from "./pages/SignIn";
import { SignUp } from "./pages/SignUp";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import { NotFound } from "./pages/NotFound";

// Helper component to handle initial redirect
function RootRedirect() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/signin" replace />;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <NotFound />,
  },
  {
    path: "/signin",
    Component: SignIn,
    errorElement: <NotFound />,
  },
  {
    path: "/signup",
    Component: SignUp,
    errorElement: <NotFound />,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
    errorElement: <NotFound />,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
    errorElement: <NotFound />,
  },
  {
    path: "/terms",
    Component: Terms,
    errorElement: <NotFound />,
  },
  {
    path: "/privacy",
    Component: Privacy,
    errorElement: <NotFound />,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    errorElement: <NotFound />,
    children: [
      { index: true, Component: DashboardHome },
      { path: "assignment-generator", Component: AssignmentGenerator },
      { path: "answer-key-generator", Component: AnswerKeyGenerator },
      { path: "upload", Component: UploadAssignment },
      { path: "evaluation", Component: Evaluation },
      { path: "plagiarism-checker", Component: PlagiarismChecker },
      { path: "feedback", Component: Feedback },
      { path: "copy-detection", Component: CopyDetection },
      { path: "student-submissions", Component: StudentSubmissions },
      { path: "doubt-solver", Component: DoubtSolver },
      { path: "class-insights", Component: ClassInsights },
      { path: "rubric-builder", Component: RubricBuilder },
      { path: "profile", Component: ProfileSettings },
    ],
  },
  {
    path: "*",
    Component: NotFound,
  },
]);