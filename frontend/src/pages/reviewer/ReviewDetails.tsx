import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { api } from "../../api/api";
import { getToken } from "../../auth/auth.storage";

interface Review {
  id: string;
  recommendation?: string | null;
  commentsToAuthor?: string | null;
  commentsToEditor?: string | null;
  attachmentPath?: string | null;
  attachmentName?: string | null;
  submittedAt?: string | null;
}

interface ReviewRequest {
  id: string;
  status: string;
  respondedAt?: string | null;
  paper: {
    id: string;
    title: string;
  };
  review: Review;
}

function ReviewDetails() {
  const { id } = useParams<{ id: string }>();

  const [reviewRequest, setReviewRequest] =
    useState<ReviewRequest | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReview = async () => {
      if (!id) {
        setError("Review request ID is missing");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const token = getToken();

        if (!token) {
          setError("Authorization token is missing");
          return;
        }

        const response = await api.get(
          `/reviewer/review-requests/${id}/review`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message ||
              "Failed to load submitted review"
          );
        }

        setReviewRequest(result.reviewRequest);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load submitted review"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReview();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-400">
          Loading review...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>

          <Link
            to="/reviewer"
            className="mt-5 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            ← Back to Reviewer Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!reviewRequest?.review) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-800 dark:bg-gray-900">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Review Not Found
            </h2>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              The submitted review could not be found.
            </p>

            <Link
              to="/reviewer"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const review = reviewRequest.review;

  const attachmentUrl = review.attachmentPath
    ? `http://localhost:4000/${review.attachmentPath.replace(
        /^\/+/,
        ""
      )}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Review Details
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              View your submitted review.
            </p>
          </div>

          <Link
            to="/reviewer"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Paper */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Research Paper
          </p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
            {reviewRequest.paper.title}
          </h2>

          {/* Status */}
          <div className="mt-5">
            <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-400">
              {reviewRequest.status}
            </span>
          </div>
        </div>

        {/* Review */}
        <div className="mt-6 space-y-6">
          {/* Recommendation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Recommendation
            </h3>

            <p className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
              {review.recommendation || "Not provided"}
            </p>
          </div>

          {/* Comments to Author */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Comments to Author
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {review.commentsToAuthor ||
                "No comments provided."}
            </p>
          </div>

          {/* Confidential Comments */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Confidential Comments to Editor
            </h3>

            <p className="mt-3 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
              {review.commentsToEditor ||
                "No confidential comments provided."}
            </p>
          </div>

          {/* Submitted Date */}
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Submitted Date
            </h3>

            <p className="mt-3 text-gray-900 dark:text-white">
              {review.submittedAt
                ? new Date(
                    review.submittedAt
                  ).toLocaleString()
                : "Not available"}
            </p>
          </div>

          {/* Attachment */}
          {attachmentUrl && (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Reviewer Attachment
              </h3>

              <p className="mt-3 text-gray-900 dark:text-white">
                {review.attachmentName ||
                  "Review attachment"}
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
                >
                  View Attachment
                </a>

                <a
                  href={attachmentUrl}
                  download={
                    review.attachmentName ||
                    "review-attachment"
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Download Attachment
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReviewDetails;