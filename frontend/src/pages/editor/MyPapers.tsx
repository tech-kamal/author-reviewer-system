import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getMyPapers,
  deletePaper,
} from "../../api/editor.api";

import type { Paper } from "../../types/paper.types";

type Contributor = {
  id?: string;
  name?: string;
  email?: string;
  affiliation?: string;
  role?: string;
};

const getContributorList = (authors: string | null): Contributor[] => {
  if (!authors) {
    return [];
  }

  try {
    const parsed = JSON.parse(authors);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [];
  } catch {
    // Existing editor-uploaded papers may contain plain text authors.
    return [
      {
        name: authors,
      },
    ];
  }
};



function MyPapers() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [paperToDelete, setPaperToDelete] =
    useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadPapers = async () => {
      try {
        setError("");

        const result = await getMyPapers();

        setPapers(result.papers);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load papers"
        );
      } finally {
        setLoading(false);
      }
    };

    loadPapers();
  }, []);

  // ============================================
  // Delete paper
  // ============================================

  const handleDelete = async () => {
    if (!paperToDelete) {
      return;
    }

    try {
      setDeleting(true);

      await deletePaper(paperToDelete);

      setPaperToDelete(null);

      const response = await getMyPapers();

      setPapers(response.papers);
    } catch (error) {
      console.error("Delete paper error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to delete paper. Please try again."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manuscript Submissions
            </h1>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Review and manage manuscripts submitted to the journal.
              </p>
          </div>

          <Link
            to="/editor/papers/upload"
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Upload Paper
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
            Loading papers...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* No papers */}
        {!loading &&
          !error &&
          papers.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                No papers found
              </h2>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Upload your first research paper.
              </p>
            </div>
          )}

        {/* Papers */}
        {!loading &&
          !error &&
          papers.length > 0 && (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {papers.map((paper) => (
                <div
                  key={paper.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Manuscript ID */}
                  <div className="mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Manuscript ID
                    </p>

                  <div className="mt-2 inline-flex max-w-full rounded-lg    bg-blue-50 px-3 py-2 dark:bg-blue-950/40">
                      <p className="break-all font-mono text-sm font-semibold text-blue-700 dark:text-blue-300">
                        {paper.manuscriptId || "Not available"}
                      </p>
                  </div>
                  </div>

                  {/* Authors */}
                 {/* Authors */}
                  <div className="mb-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Author(s)
                    </p>

                    <div className="mt-2 space-y-1.5">
                      {getContributorList(paper.authors ?? null).length > 0 ? (
                        getContributorList(paper.authors ?? null).map((contributor, index) => (
                          <div
                            key={contributor.id || `${contributor.name}-${index}`}
                            className="flex flex-wrap items-center gap-2"
                          >
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {contributor.name || "Unnamed contributor"}
                            </p>

                            {contributor.role && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                                {contributor.role}
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Not available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Paper Title */}
                  <h2 className="line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">
                    {paper.title}
                  </h2>

                  {/* Created Date */}
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Created:{" "}
                    {new Date(
                      paper.createdAt
                    ).toLocaleDateString()}
                  </p>

                    {/* Submission Status */}
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Submission Status
                      </p>

                      <div className="mt-2">
                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          Submitted
                        </span>
                      </div>
                    </div>

                  {/* Review Status */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Review Status
                    </p>

                    <div className="mt-2">
                      {paper.reviewRequests &&
                      paper.reviewRequests.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {paper.reviewRequests.length} Reviewer
                            {paper.reviewRequests.length !== 1
                              ? "s"
                              : ""}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {paper.reviewRequests.map(
                              (request) => (
                                <span
                                  key={request.id}
                                  className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400"
                                >
                                  {request.status}
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          0 Reviewers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Final Decision */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Final Decision
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {paper.editorialDecision || "Pending"}
                    </p>

                    {paper.decisionAt && (
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {new Date(
                          paper.decisionAt
                        ).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {/* View Details */}
                    <Link
                      to={`/editor/papers/${paper.id}`}
                      className="text-sm font-semibold text-blue-500 transition hover:text-blue-400"
                    >
                      View Details →
                    </Link>

                    {/* Edit */}
                    <Link
                      to={`/editor/papers/${paper.id}/edit`}
                      className="rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-500 transition hover:bg-blue-500 hover:text-white"
                    >
                      Edit
                    </Link>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() =>
                        setPaperToDelete(paper.id)
                      }
                      className="rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      {/* ============================================
          Delete Confirmation Dialog
          ============================================ */}

      {paperToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            {/* Dialog Header */}
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                !
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Paper?
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this
                  paper? This action cannot be undone.
                </p>

                <p className="mt-2 text-sm leading-6 text-red-600 dark:text-red-400">
                  All related review requests and reviews
                  will also be removed.
                </p>
              </div>
            </div>

            {/* Dialog Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              {/* Cancel */}
              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  setPaperToDelete(null)
                }
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>

              {/* Confirm Delete */}
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Paper"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyPapers;