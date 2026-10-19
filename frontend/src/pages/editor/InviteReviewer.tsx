import { useEffect, useState } from "react";

import {
  createReviewRequest,
  getReviewers,
} from "../../api/editor.api";

import type { Reviewer } from "../../types/paper.types";

interface InviteReviewerProps {
  paperId: string;
  onSuccess: () => void;
}

function InviteReviewer({
  paperId,
  onSuccess,
}: InviteReviewerProps) {
  const [reviewers, setReviewers] = useState<
    Reviewer[]
  >([]);

  const [reviewerId, setReviewerId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadReviewers = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getReviewers();

        setReviewers(result.reviewers);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load reviewers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadReviewers();
  }, []);

  const handleInvite = async () => {
    setError("");
    setSuccess("");

    if (!reviewerId) {
      setError("Please select a reviewer");
      return;
    }

    try {
      setSubmitting(true);

      const result =
        await createReviewRequest(
          paperId,
          reviewerId,
          dueDate
        );

      setSuccess(
        result.message ||
          "Reviewer invited successfully"
      );

      setReviewerId("");
      setDueDate("");

      onSuccess();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to invite reviewer"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Invite Reviewer
      </h3>

      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Assign a reviewer to this paper.
      </p>

      {loading ? (
        <p className="mt-5 text-sm text-gray-500 dark:text-gray-400">
          Loading reviewers...
        </p>
      ) : (
        <div className="mt-5 space-y-5">
          {/* Reviewer */}
          <div>
            <label
              htmlFor="reviewer"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Reviewer
            </label>

            <select
              id="reviewer"
              value={reviewerId}
              onChange={(event) =>
                setReviewerId(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">
                Select a reviewer
              </option>

              {reviewers.map((reviewer) => (
                <option
                  key={reviewer.id}
                  value={reviewer.id}
                >
                  {reviewer.name} — {reviewer.email}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date */}
          <div>
            <label
              htmlFor="dueDate"
              className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
            >
              Due Date
            </label>

            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(event) =>
                setDueDate(event.target.value)
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
              {success}
            </div>
          )}

          {/* Invite Button */}
          <button
            type="button"
            onClick={handleInvite}
            disabled={submitting || reviewers.length === 0}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Sending..."
              : "Send Invitation"}
          </button>
        </div>
      )}
    </div>
  );
}

export default InviteReviewer;