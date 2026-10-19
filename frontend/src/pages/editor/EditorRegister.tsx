import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  registerEditor,
  validateEditorInvitation,
} from "../../editor/editorInvitation.api";


import ThemeToggle from "../../components/ThemeToggle";

function EditorRegister() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  // ============================================
  // Validate Invitation
  // ============================================

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError("Invalid invitation link");
        setLoading(false);
        return;
      }

      try {
        const result =
          await validateEditorInvitation(token);

        setEmail(result.invitation.email);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Invalid or expired invitation"
        );
      } finally {
        setLoading(false);
      }
    };

    validate();
  }, [token]);

  // ============================================
  // Submit Registration
  // ============================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!token) {
      setError("Invalid invitation link");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters"
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setSubmitting(true);

      const result = await registerEditor(
        token,
        {
          name: name.trim(),
          password,
        }
      );

      // ============================================
      // Save authentication
      // ============================================

      // Note:
      // Registration endpoint currently returns
      // user information but not a JWT token.
      // Therefore we do not save auth here.

      alert(result.message);

      navigate("/login", {
        replace: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Editor registration failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ============================================
  // Loading
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

          <p className="text-gray-600 dark:text-gray-300">
            Validating invitation...
          </p>
        </div>
      </div>
    );
  }

  // ============================================
  // Invalid invitation
  // ============================================

  if (error && !email) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div>
              <h1 className="text-lg font-bold">
                TSP Reviewer System
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Editor Registration
              </p>
            </div>

            <ThemeToggle />
          </div>
        </header>

        <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">
          <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-900 sm:p-8">
            <div className="mb-5 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl dark:bg-red-900/30">
                ⚠️
              </div>

              <h2 className="text-xl font-bold">
                Invalid Invitation
              </h2>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {error}
              </p>
            </div>

            <Link
              to="/login"
              className="block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Go to Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ============================================
  // Registration Page
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold sm:text-xl">
              Journal Reviewer System
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Editor Registration
            </p>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* Main */}
      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
            {/* Heading */}
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl dark:bg-blue-900/30">
                ✉️
              </div>

              <h2 className="text-2xl font-bold">
                Create Editor Account
              </h2>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You have been invited to join the
                editorial team.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                />

                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  This email was specified by the
                  administrator.
                </p>
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Minimum 8 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Confirm Password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "Creating Account..."
                  : "Create Editor Account"}
              </button>
            </form>

            {/* Login */}
            <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default EditorRegister;