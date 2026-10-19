import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMySubmissionDrafts,
  deleteSubmissionDraft,
  type SubmissionDraft,
} from "../../submission/submission-draft.api";

const TOTAL_STEPS = 6;

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function SubmissionDrafts() {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<SubmissionDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getMySubmissionDrafts();

      setDrafts(
        (result.drafts || []).filter(
          (draft) => draft.status === "DRAFT" &&
          draft.currentStep < 6
        )
      );
    } catch (error) {
      console.error("Failed to load submission drafts:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to load your drafts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrafts();
  }, []);

    const handleContinueDraft = (draftId: string) => {
    navigate(`/author/new-submission?draftId=${draftId}`);
    };

  const handleDeleteDraft = async (draftId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this draft?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(draftId);

      await deleteSubmissionDraft(draftId);

      setDrafts((previous) =>
        previous.filter((draft) => draft.id !== draftId)
      );
    } catch (error) {
      console.error("Failed to delete draft:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete the draft."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Draft Submissions
            </h1>

            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Continue your incomplete manuscript submissions from where
              you left off.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/author")}
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back to Author Dashboard
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Loading your drafts...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              {error}
            </p>

            <button
              type="button"
              onClick={loadDrafts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && drafts.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl dark:bg-amber-950">
              ✎
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900 dark:text-white">
              No Draft Submissions
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
              You don't have any incomplete manuscript submissions at the
              moment.
            </p>

            <button
              type="button"
              onClick={() => navigate("/author/new-submission")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Start New Submission
            </button>
          </div>
        )}

        {/* Draft List */}
        {!loading && !error && drafts.length > 0 && (
          <div className="space-y-5">
            {drafts.map((draft) => {
              const progress = Math.min(
                100,
                Math.max(
                  0,
                  (draft.currentStep / TOTAL_STEPS) * 100
                )
              );

              return (
                <div
                  key={draft.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    {/* Draft Information */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                          Draft
                        </span>

                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Step {draft.currentStep} of {TOTAL_STEPS}
                        </span>
                      </div>

                      <h2 className="mt-4 truncate text-lg font-semibold text-gray-900 dark:text-white">
                        {draft.title?.trim() || "Untitled Manuscript"}
                      </h2>

                      <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            Manuscript ID:
                          </span>{" "}
                          {draft.manuscriptId || "Not generated yet"}
                        </p>

                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium text-gray-800 dark:text-gray-200">
                            Last updated:
                          </span>{" "}
                          {formatDate(draft.updatedAt)}
                        </p>
                      </div>

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-500 dark:text-gray-400">
                            Submission Progress
                          </span>

                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
                          <div
                            className="h-full rounded-full bg-blue-600 transition-all"
                            style={{
                              width: `${progress}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                      <button
                        type="button"
                        onClick={() =>
                          handleContinueDraft(draft.id)
                        }
                        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Continue Draft →
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDeleteDraft(draft.id)
                        }
                        disabled={deletingId === draft.id}
                        className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        {deletingId === draft.id
                          ? "Deleting..."
                          : "Delete Draft"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}