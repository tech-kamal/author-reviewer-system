import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";

// Public Pages
import Home from "./pages/Home";
import Services from "./pages/Services";
import Information from "./pages/Information";

// Authentication
import Login from "./pages/Login";
import EditorRegister from "./pages/editor/EditorRegister";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Register from "./pages/Register";

// Layouts
import MainLayout from "./layouts/MainLayout";
import WorkspaceLayout from "./layouts/WorkspaceLayout";

// Common
import ProtectedRoute from "./components/ProtectedRoute";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";


// Editor
import EditorDashboard from "./pages/EditorDashboard";
import MyPapers from "./pages/editor/MyPapers";
import RevisionSent from "./pages/editor/RevisionSent";
import UploadPaper from "./pages/editor/UploadPaper";
import PaperDetails from "./pages/editor/PaperDetails";
import EditPaper from "./pages/editor/EditPaper";
import AuthorDashboard from "./pages/AuthorDashboard";
import NewSubmission from "./pages/NewSubmission";
import SubmissionDrafts from "./pages/author/SubmissionDrafts";
import SavedSubmissions from "./pages/author/SavedSubmissions";
import AuthorSubmissionDetails from "./pages/author/AuthorSubmissionDetails";
import IdleSessionManager from "./auth/IdleSessionManager";


// Profile
import Profile from "./pages/Profile";

// Reviewer
import ReviewerDashboard from "./pages/ReviewerDashboard";
import ReviewInvitation from "./pages/reviewer/ReviewInvitation";
import ReviewForm from "./pages/reviewer/ReviewForm";
import ReviewDetails from "./pages/reviewer/ReviewDetails";


function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
      <IdleSessionManager />

        <Routes>

          {/* =====================================================
              PUBLIC WEBSITE
              ===================================================== */}

          <Route element={<MainLayout />}>

            {/* Home */}
            <Route
              path="/"
              element={<Home />}
            />

            {/* Services */}
            <Route
              path="/services"
              element={<Services />}
            />

            {/* Information */}
            <Route
              path="/information"
              element={<Information />}
            />

            {/* =================================================
                AUTHENTICATION
                ================================================= */}

            {/* Login */}
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
            path="/forgot-password"
            element={<ForgotPassword />}
            />

            <Route
              path="/reset-password"
              element={<ResetPassword />}
            />


            {/* Reviewer Registration */}
            <Route
              path="/register"
              element={<Register />}
            />

            {/* Editor Registration through Invitation */}
            <Route
              path="/editor/register/:token"
              element={<EditorRegister />}
            />

          

          </Route>


          {/* =====================================================
              REVIEW INVITATION
              ===================================================== */}

          <Route
            path="/review/invitation/:token/:action"
            element={<ReviewInvitation />}
          />


          {/* =====================================================
              WORKSPACE LAYOUT
              ===================================================== */}

          <Route element={<WorkspaceLayout />}>

            {/* =================================================
                REVIEWER WORKSPACE
                ================================================= */}

            {/* Reviewer Dashboard */}

            <Route
              path="/reviewer"
              element={
                <ProtectedRoute allowedRole="REVIEWER">
                  <ReviewerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Reviewer - Review Form */}

            <Route path="/reviewer/review/:id" element={<ProtectedRoute allowedRole="REVIEWER">
                  <ReviewForm /></ProtectedRoute>
              }
            />

            {/* Reviewer - Submitted Review Details */}

            <Route path="/reviewer/review/:id/view" element={<ProtectedRoute allowedRole="REVIEWER"> 
            <ReviewDetails /></ProtectedRoute>
              }
            />

            <Route path="/author" element={<AuthorDashboard />} />
            <Route path="/author/new-submission" element={<NewSubmission />} />
            <Route
              path="/author/submission/drafts"
              element={<SubmissionDrafts />}
            />
            <Route
              path="/author/submission/saved"
              element={<SavedSubmissions />}
            />
            <Route
              path="/author/submission/:id"
              element={<AuthorSubmissionDetails />}
            />
          </Route>


          <Route
            path="/editor"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <EditorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Editor - My Papers */}

          <Route
            path="/editor/papers"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <MyPapers />
              </ProtectedRoute>
            }
          />

          {/* Editor - Upload Paper */}

          <Route
            path="/editor/papers/upload"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <UploadPaper />
              </ProtectedRoute>
            }
          />

          {/* Editor - Paper Details */}

          <Route
            path="/editor/papers/:id"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <PaperDetails />
              </ProtectedRoute>
            }
          />

          {/* Editor - Revision Sent Successfully */}

          <Route
            path="/editor/revision-sent"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <RevisionSent />
              </ProtectedRoute>
            }
          />

          {/* Editor - Edit Paper */}

          <Route
            path="/editor/papers/:id/edit"
            element={
              <ProtectedRoute allowedRole="EDITOR">
                <EditPaper />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              ADMIN
              ===================================================== */}

          {/* Admin Dashboard */}

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />


          {/* =====================================================
              PROFILE
              ===================================================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* =====================================================
              UNKNOWN ROUTES
              ===================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>
    </ThemeProvider>
  );
}


export default App;