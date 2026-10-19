import {
  useState,
} from "react";


import type {
  FormEvent,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import { api } from "../../api/api";

function ReviewForm() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const [recommendation, setRecommendation] =
    useState("");

  const [commentsToAuthor, setCommentsToAuthor] =
    useState("");

  const [commentsToEditor, setCommentsToEditor] =
    useState("");

  const [attachment, setAttachment] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ============================================
  // File selection
  // ============================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] || null;

    setError("");

    if (!file) {
      setAttachment(null);
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      setAttachment(null);

      event.target.value = "";

      setError(
        "Only PDF, DOC, and DOCX files are allowed."
      );

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAttachment(null);

      event.target.value = "";

      setError(
        "File size must not exceed 10 MB."
      );

      return;
    }

    setAttachment(file);
  };

  // ============================================
  // Submit review
  // ============================================

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!id) {
      setError(
        "Review request ID is missing."
      );
      return;
    }

    if (
      !commentsToAuthor.trim()
    ) {
      setError(
        "Comments to author are required."
      );
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();

      if (recommendation.trim()) {
        formData.append(
          "recommendation",
          recommendation.trim()
        );
      }

      formData.append(
        "commentsToAuthor",
        commentsToAuthor.trim()
      );

      if (commentsToEditor.trim()) {
        formData.append(
          "commentsToEditor",
          commentsToEditor.trim()
        );
      }

      if (attachment) {
        formData.append(
          "attachment",
          attachment
        );
      }

      const response =
        await api.post(
          `/reviewer/review-requests/${id}/submit`,
          formData
        );

      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Unable to submit review."
        );
      }

      setSuccess(
        "Review submitted successfully."
      );

      setTimeout(() => {
        navigate("/reviewer");
      }, 1500);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">

        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Review Form
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Submit your review for the assigned
            research paper.
          </p>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900"
        >

          {/* Error */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success */}

          {success && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Recommendation */}

          <div className="mb-6">
            <label
              htmlFor="recommendation"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Recommendation
            </label>

            <select
              id="recommendation"
              value={recommendation}
              onChange={(event) =>
                setRecommendation(
                  event.target.value
                )
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="">
                Select recommendation
              </option>

              <option value="ACCEPT">
                Accept
              </option>

              <option value="MINOR_REVISION">
                Minor Revision
              </option>

              <option value="MAJOR_REVISION">
                Major Revision
              </option>

              <option value="REJECT">
                Reject
              </option>
            </select>
          </div>

          {/* Comments to Author */}

          <div className="mb-6">
            <label
              htmlFor="commentsToAuthor"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Comments to Author *
            </label>

            <textarea
              id="commentsToAuthor"
              value={commentsToAuthor}
              onChange={(event) =>
                setCommentsToAuthor(
                  event.target.value
                )
              }
              rows={8}
              placeholder="Enter your comments for the author..."
              required
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Comments to Editor */}

          <div className="mb-6">
            <label
              htmlFor="commentsToEditor"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confidential Comments to Editor
            </label>

            <textarea
              id="commentsToEditor"
              value={commentsToEditor}
              onChange={(event) =>
                setCommentsToEditor(
                  event.target.value
                )
              }
              rows={6}
              placeholder="Enter confidential comments for the editor..."
              className="w-full resize-y rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Attachment */}

          <div className="mb-8">
            <label
              htmlFor="attachment"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Reviewer Attachment
              <span className="ml-2 font-normal text-gray-500">
                (Optional)
              </span>
            </label>

            <input
              id="attachment"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-gray-100 file:px-4 file:py-3 file:font-medium dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:file:bg-gray-700"
            />

            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Allowed formats: PDF, DOC, DOCX.
              Maximum size: 10 MB.
            </p>

            {attachment && (
              <p className="mt-3 text-sm text-green-600 dark:text-green-400">
                ✓ {attachment.name}
              </p>
            )}
          </div>

          {/* Submit */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "Submitting Review..."
              : "Submit Review"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ReviewForm;