import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMySubmissionDrafts,
  // getMySubmissions,
  deleteSubmissionDraft,
  type SubmissionDraft,
} from "../../submission/submission-draft.api";



const SavedSubmissions = () => {
  const navigate = useNavigate();

  const [drafts, setDrafts] = useState<SubmissionDraft[]>([]);
  // const [submissions, setSubmissions] = useState<Submission[]>([]);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSavedSubmissions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getMySubmissionDrafts();
        const savedDrafts = (response.drafts || []).filter(
          (draft) =>
            draft.status === "DRAFT" &&
            draft.currentStep === 6
        );

        setDrafts(savedDrafts);
      } catch (err) {
        console.error(
          "Failed to load saved submissions:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load saved submissions."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSavedSubmissions();
  }, []);

  const handleContinue = (draftId: string) => {
    navigate(
      `/author/new-submission?draftId=${draftId}`
    );
  };

  const handleDeleteSavedSubmission = async (
    draftId: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this saved submission?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(draftId);

      await deleteSubmissionDraft(draftId);

      setDrafts((previous) =>
        previous.filter(
          (draft) => draft.id !== draftId
        )
      );
    } catch (err) {
      console.error(
        "Failed to delete saved submission:",
        err
      );

      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete the saved submission."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Saved Submissions
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Continue working on your saved manuscript submissions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/author")}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back to Author Dashboard
          </button>
        </div>

        {/* =====================================================
            SAVED DRAFTS
        ====================================================== */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Your Saved Submissions
            </h2>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              These submissions have completed all 6 steps and are saved
              for later submission.
            </p>
          </div>

          {loading ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading saved submissions...
            </div>
          ) : error ? (
            <div className="px-5 py-10 text-center text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          ) : drafts.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No Saved Submissions
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
                You do not have any completed saved submissions yet.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/author/new-submission")
                }
                className="mt-5 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Start New Submission
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">

              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
                >

                  {/* Submission Information */}
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                      {draft.title || "Untitled Submission"}
                    </h3>

                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Step {draft.currentStep} of 6
                      </span>

                      <span>•</span>

                      <span>
                        Last updated{" "}
                        {new Date(
                          draft.updatedAt
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-2 sm:flex-row">

                    {/* Continue */}
                    <button
                      type="button"
                      onClick={() =>
                        handleContinue(draft.id)
                      }
                      className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                    >
                      Continue →
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteSavedSubmission(
                          draft.id
                        )
                      }
                      disabled={
                        deletingId === draft.id
                      }
                      className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {deletingId === draft.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedSubmissions;