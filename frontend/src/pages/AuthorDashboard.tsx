import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getToken } from "../auth/auth.storage";


import {
  getMySubmissions,
  createWithdrawalRequest,
  getMyWithdrawalRequests,
  deleteWithdrawnManuscript,
  getMyRevisionRequests,
  acknowledgeRevisionRequest,
  type AuthorRevisionRequest,
  type WithdrawalRequest,
} from "../submission/submission-draft.api";

type Submission = {
  id: string;
  manuscriptId: string | null;
  title: string;
  abstract: string | null;
  keywords: string | null;
  authors: string | null;
  editorialDecision: string | null;
  decisionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

const formatAuthors = (authors: string | null): string => {
  if (!authors) {
    return "";
  }

  try {
    const parsed = JSON.parse(authors);

    if (Array.isArray(parsed)) {
      return parsed
        .map((author) =>
          typeof author === "string"
            ? author
            : author?.name
        )
        .filter(Boolean)
        .join(", ");
    }

    if (
      parsed &&
      typeof parsed === "object" &&
      "name" in parsed
    ) {
      return String(parsed.name);
    }

    return authors;
  } catch {
    return authors;
  }
};

export default function AuthorDashboard() {
  const navigate = useNavigate();

  // ============================================
  // Tabs
  // ============================================

  const [activeTab, setActiveTab] =
    useState("overview");

  // ============================================
  // Submissions
  // ============================================

  const [submissions, setSubmissions] =
    useState<Submission[]>([]);

  const [loadingSubmissions, setLoadingSubmissions] =
    useState(true);

  const [submissionError, setSubmissionError] =
    useState("");

  // ============================================
  // Withdrawal
  // ============================================

  const [withdrawalRequests, setWithdrawalRequests] =
    useState<WithdrawalRequest[]>([]);

  const [withdrawalLoading, setWithdrawalLoading] =
    useState(false);

  const [withdrawalError, setWithdrawalError] =
    useState("");

  const [
    selectedWithdrawalPaper,
    setSelectedWithdrawalPaper,
  ] = useState<Submission | null>(null);

  const [withdrawalReason, setWithdrawalReason] =
    useState("");

  const [withdrawalSubmitting, setWithdrawalSubmitting] =
    useState(false);


    // ============================================
// Revision Requests
// ============================================

const [revisionRequests, setRevisionRequests] =
  useState<AuthorRevisionRequest[]>([]);

const [revisionLoading, setRevisionLoading] =
  useState(false);

const [revisionError, setRevisionError] =
  useState("");

const [acknowledgingId, setAcknowledgingId] =
  useState<string | null>(null);


  // ============================================
  // Load submissions
  // ============================================

  const loadSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      setSubmissionError("");

      const result = await getMySubmissions();

      setSubmissions(result.submissions || []);
    } catch (error) {
      console.error(
        "Failed to load submissions:",
        error
      );

      setSubmissionError(
        error instanceof Error
          ? error.message
          : "Failed to load your submissions."
      );
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // ============================================
  // Load withdrawal requests
  // ============================================

  const loadWithdrawalRequests = async () => {
    try {
      setWithdrawalLoading(true);
      setWithdrawalError("");

      const result =
        await getMyWithdrawalRequests();

      setWithdrawalRequests(
        result.withdrawalRequests || []
      );
    } catch (error) {
      console.error(
        "Failed to load withdrawal requests:",
        error
      );

      setWithdrawalError(
        error instanceof Error
          ? error.message
          : "Failed to load withdrawal requests."
      );
    } finally {
      setWithdrawalLoading(false);
    }
  };


const loadRevisionRequests = async () => {
  try {
    setRevisionLoading(true);
    setRevisionError("");

    const result = await getMyRevisionRequests();

    setRevisionRequests(result.revisionRequests || []);
  } catch (error) {
    console.error("Failed to load revision requests:", error);

    setRevisionError(
      error instanceof Error
        ? error.message
        : "Failed to load revision requests."
    );
  } finally {
    setRevisionLoading(false);
  }
};


const handleAcknowledgeRevision = async (
  revisionRequestId: string
) => {
  try {
    setAcknowledgingId(revisionRequestId);
    setRevisionError("");

    await acknowledgeRevisionRequest(revisionRequestId);

    await loadRevisionRequests();
  } catch (error) {
    setRevisionError(
      error instanceof Error
        ? error.message
        : "Failed to acknowledge revision request."
    );
  } finally {
    setAcknowledgingId(null);
  }
};
  // ============================================
  // Initial load
  // ============================================

  useEffect(() => {
      loadSubmissions();
      loadWithdrawalRequests();
      loadRevisionRequests();
  }, []);

  // ============================================
  // Statistics
  // ============================================

  const totalManuscripts = submissions.length;

  const underReview = submissions.filter(
    (submission) =>
      !submission.editorialDecision
  ).length;

  const revisionRequired = submissions.filter(
    (submission) =>
      submission.editorialDecision ===
        "MINOR_REVISION" ||
      submission.editorialDecision ===
        "MAJOR_REVISION"
  ).length;

  const decisions = submissions.filter(
    (submission) =>
      Boolean(submission.editorialDecision)
  ).length;

  // ============================================
  // Status
  // ============================================

  const getStatus = (
    submission: Submission
  ) => {
    if (!submission.editorialDecision) {
      return {
        label: "Under Editorial Review",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      };
    }

    switch (submission.editorialDecision) {
      case "ACCEPT":
        return {
          label: "Accepted",
          className:
            "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
        };

      case "MINOR_REVISION":
        return {
          label: "Minor Revision",
          className:
            "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        };

      case "MAJOR_REVISION":
        return {
          label: "Major Revision",
          className:
            "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
        };

      case "REJECT":
        return {
          label: "Rejected",
          className:
            "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        };

      default:
        return {
          label: submission.editorialDecision,
          className:
            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  // ============================================
  // Date formatting
  // ============================================

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ============================================
  // Find latest withdrawal request
  // ============================================

  const getWithdrawalRequestForPaper = (
    paperId: string
  ) => {
    return withdrawalRequests.find(
      (request) =>
        request.paperId === paperId
    );
  };

  // ============================================
  // Check whether manuscript is withdrawn
  // ============================================

  const isPaperWithdrawn = (
    paper: Submission
  ) => {
    const request =
      getWithdrawalRequestForPaper(
        paper.id
      );

    return (
      request?.status === "APPROVED"
    );
  };

  const activeSubmissions = submissions.filter(
  (submission) =>
    !isPaperWithdrawn(submission)
);

  // ============================================
  // Check whether withdrawal is pending
  // ============================================

  const isWithdrawalPending = (
    paper: Submission
  ) => {
    const request =
      getWithdrawalRequestForPaper(
        paper.id
      );

    return (
      request?.status === "PENDING"
    );
  };

  // ============================================
  // Open withdrawal modal
  // ============================================

  const openWithdrawalModal = (
    paper: Submission
  ) => {
    setSelectedWithdrawalPaper(paper);
    setWithdrawalReason("");
  };

  // ============================================
  // Close withdrawal modal
  // ============================================

  const closeWithdrawalModal = () => {
    if (withdrawalSubmitting) {
      return;
    }

    setSelectedWithdrawalPaper(null);
    setWithdrawalReason("");
  };

  // ============================================
  // Submit withdrawal request
  // ============================================

  const handleWithdrawalSubmit = async () => {
    if (!selectedWithdrawalPaper) {
      return;
    }

    const reason =
      withdrawalReason.trim();

    if (!reason) {
      alert(
        "Please enter a reason for manuscript withdrawal."
      );
      return;
    }

    if (reason.length < 10) {
      alert(
        "Withdrawal reason must be at least 10 characters."
      );
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to submit this manuscript withdrawal request?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setWithdrawalSubmitting(true);

      await createWithdrawalRequest(
        selectedWithdrawalPaper.id,
        reason
      );

      setSelectedWithdrawalPaper(null);
      setWithdrawalReason("");

      await loadWithdrawalRequests();

      alert(
        "Withdrawal request submitted successfully."
      );
    } catch (error) {
      console.error(
        "Withdrawal request error:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Failed to submit withdrawal request."
      );
    } finally {
      setWithdrawalSubmitting(false);
    }
  };


  const handleDeleteWithdrawnManuscript = async (
  paperId: string
) => {
  try {
    await deleteWithdrawnManuscript(paperId);

    await loadSubmissions();
    await loadWithdrawalRequests();

    alert(
      "Withdrawn manuscript deleted successfully."
    );
  } catch (error) {
    console.error(
      "Delete withdrawn manuscript error:",
      error
    );

    alert(
      error instanceof Error
        ? error.message
        : "Failed to delete withdrawn manuscript."
    );
  }
};


const downloadRevisionPDF = async (
  revisionRequestId: string,
  fileName?: string | null
) => {
  try {
    const token = getToken();

    if (!token) {
      alert("Session expired. Please log in again.");
      return;
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/author/revision-requests/${encodeURIComponent(
        revisionRequestId
      )}/attachment`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(
        result?.message || "Unable to download PDF."
      );
    }

    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName || "reviewer-attachment.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("PDF download failed:", error);

    alert(
      error instanceof Error
        ? error.message
        : "Unable to download PDF."
    );
  }
};
  // ============================================
  // Render
  // ============================================

  return (
    <div className="w-full bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ============================================
            Page Header
        ============================================ */}

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Author Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Submit and track your manuscripts from
            one place.
          </p>
        </div>

        {/* ============================================
            Tabs
        ============================================ */}

        <div className="mb-8 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800">

          {/* Overview */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("overview")
            }
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "overview"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Overview
          </button>

          {/* My Manuscripts */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("manuscripts")
            }
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "manuscripts"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            My Manuscripts
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("revisions")}
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "revisions"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Revision Requests
          </button>

          {/* Submit */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("submit")
            }
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "submit"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Submit Manuscript
          </button>

          {/* Final Publication */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("publication")
            }
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "publication"
                ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Final Publication
          </button>

          {/* Withdraw */}

          <button
            type="button"
            onClick={() =>
              setActiveTab("withdraw")
            }
            className={`rounded-t-lg px-5 py-3 text-sm font-medium transition ${
              activeTab === "withdraw"
                ? "border-b-2 border-red-600 text-red-600 dark:text-red-400"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* ============================================
            OVERVIEW
        ============================================ */}

        {activeTab === "overview" && (
          <>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

              <StatCard
                title="Total Manuscripts"
                value={String(
                  totalManuscripts
                )}
              />

              <StatCard
                title="Under Review"
                value={String(underReview)}
              />

              <StatCard
                title="Revision Required"
                value={String(
                  revisionRequired
                )}
              />

              <StatCard
                title="Decisions"
                value={String(decisions)}
              />
            </div>

            <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Welcome to Author Workspace
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                From here you will be able to
                submit manuscripts, track the
                editorial and review process,
                respond to revision requests,
                request manuscript withdrawal,
                and view the final editorial
                decision.
              </p>
            </div>
          </>
        )}

        {/* ============================================
            MY MANUSCRIPTS
        ============================================ */}

        {activeTab === "manuscripts" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                My Manuscripts
              </h2>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Track your submitted manuscripts
                and editorial status.
              </p>
            </div>

            {/* Loading */}

            {loadingSubmissions && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading your manuscripts...
                </p>
              </div>
            )}

            {/* Error */}

            {!loadingSubmissions &&
              submissionError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {submissionError}
                  </p>
                </div>
              )}

            {/* Empty */}

            {!loadingSubmissions &&
              !submissionError &&
              submissions.length === 0 && (
                <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                    <span className="text-2xl">
                      +
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">
                    No submissions yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                    Your submitted manuscripts will
                    appear here once you complete a
                    manuscript submission.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(
                        "/author/new-submission"
                      )
                    }
                    className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    Start New Submission
                  </button>
                </div>
              )}

            {/* Submission List */}

            {!loadingSubmissions &&
              !submissionError &&
              submissions.length > 0 && (
                <div className="space-y-5">
                  {activeSubmissions.map(
                    (submission) => {
                      const status =
                        getStatus(
                          submission
                        );

                      const withdrawalRequest =
                        getWithdrawalRequestForPaper(
                          submission.id
                        );

                      const withdrawn =
                        isPaperWithdrawn(
                          submission
                        );

                      const pending =
                        isWithdrawalPending(
                          submission
                        );

                      return (
                        <div
                          key={submission.id}
                          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                        >
                          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

                            <div className="min-w-0 flex-1">

                              {/* Manuscript ID */}

                              <div className="mb-3">
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  Manuscript ID
                                </p>

                                <p className="mt-1 break-all font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                  {submission.manuscriptId ||
                                    "Not available"}
                                </p>
                              </div>

                              {/* Title */}

                              <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                                {submission.title}
                              </h3>

                              {/* Authors */}

                              {submission.authors && (
                                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-800 dark:text-gray-200">
                                      Author(s):
                                    </span>{" "}
                                    {formatAuthors(submission.authors)}
                                  </p>
                              )}

                              {/* Date */}

                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Submitted on{" "}
                                {formatDate(
                                  submission.createdAt
                                )}
                              </p>
                            </div>

                            {/* Status */}

                            <div className="shrink-0">
                              <span
                                className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${status.className}`}
                              >
                                {withdrawn
                                  ? "Withdrawn"
                                  : status.label}
                              </span>
                            </div>
                          </div>

                          {/* ====================================
                              Withdrawal Status
                          ==================================== */}

                          {!submission.editorialDecision &&
                            !withdrawn && (
                              <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">

                                {/* Pending */}

                                {pending &&
                                  withdrawalRequest && (
                                    <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                                            Withdrawal Request Pending
                                          </p>

                                          <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                                            Submitted on{" "}
                                            {formatDateTime(
                                              withdrawalRequest.requestedAt
                                            )}
                                          </p>
                                        </div>

                                        <span className="w-fit rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                                          PENDING
                                        </span>
                                      </div>

                                      <div className="mt-3">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-yellow-700 dark:text-yellow-400">
                                          Your Reason
                                        </p>

                                        <p className="mt-1 text-sm leading-6 text-yellow-800 dark:text-yellow-300">
                                          {
                                            withdrawalRequest.reason
                                          }
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                {/* Rejected */}

                                {!pending &&
                                  withdrawalRequest?.status ===
                                    "REJECTED" && (
                                    <div className="space-y-3">
                                      <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                                            Withdrawal Request Rejected
                                          </p>

                                          <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                                            REJECTED
                                          </span>
                                        </div>

                                        {withdrawalRequest.editorComment && (
                                          <div className="mt-3">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-red-700 dark:text-red-400">
                                              Editor Comment
                                            </p>

                                            <p className="mt-1 text-sm leading-6 text-red-800 dark:text-red-300">
                                              {
                                                withdrawalRequest.editorComment
                                              }
                                            </p>
                                          </div>
                                        )}
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          openWithdrawalModal(
                                            submission
                                          )
                                        }
                                        className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                                      >
                                        Request Withdrawal Again
                                      </button>
                                    </div>
                                  )}

                                {/* First Withdrawal Request */}

                                {!pending &&
                                  !withdrawalRequest && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        openWithdrawalModal(
                                          submission
                                        )
                                      }
                                      className="rounded-lg border border-red-300 cursor-pointer px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                                    >
                                      Withdraw Manuscript
                                    </button>
                                  )}
                              </div>
                            )}

                          {/* ====================================
                              Editorial Decision
                          ==================================== */}

                          {submission.editorialDecision && (
                            <div className="mt-5 border-t border-gray-100 pt-5 dark:border-gray-800">
                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Editorial decision
                                </p>

                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {status.label}
                                </p>
                              </div>

                              {submission.decisionAt && (
                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                  Decision date:{" "}
                                  {formatDate(
                                    submission.decisionAt
                                  )}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              )}
          </div>
        )}

        {/* ============================================
            SUBMIT MANUSCRIPT
        ============================================ */}
{/* ============================================
    REVISION REQUESTS
============================================ */}

{activeTab === "revisions" && (
  <div>
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Revision Requests
      </h2>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
        Review the editor's comments and submit your revised manuscript.
      </p>
    </div>

    {revisionError && (
      <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
        {revisionError}
      </div>
    )}

    {revisionLoading ? (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Loading revision requests...
      </p>
    ) : revisionRequests.length === 0 ? (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No revision requests found.
        </p>
      </div>
    ) : (
      <div className="space-y-5">
        {revisionRequests.map((request) => (
          <div
            key={request.id}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Manuscript ID
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {request.paper.manuscriptId || "Not available"}
                </p>

                <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">
                  {request.paper.title}
                </h3>
              </div>

              <span className="inline-flex w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                {request.revisionType === "MAJOR_REVISION"
                  ? "Major Revision"
                  : "Minor Revision"}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Reviewer Report
              </h4>
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {request.reviewReport || "No reviewer report provided."}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                Comments to Author
              </h4>
              <div className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-6 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {request.commentsToAuthor || "No additional comments provided."}
              </div>
            </div>

              {/* Revision PDF Attachment */}
              {request.revisionFilePath && (
                <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                  <p className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
                    PDF Attachment
                  </p>

                  <p className="mb-3 break-all text-sm text-gray-600 dark:text-gray-300">
                    {request.revisionFileName || "Reviewer attachment.pdf"}
                  </p>

                 <div className="flex flex-wrap gap-3">
                  <a
                    href={`${import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")}/${request.revisionFilePath.replace(/^\/+/, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View PDF
                  </a>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    void downloadRevisionPDF(
                      request.id,
                      request.revisionFileName
                    );
                  }}
                  className="inline-flex items-center rounded-lg border border-blue-300 px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  Download PDF
                </button>
                </div>
                </div>
              )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Status:{" "}
                <strong className="text-gray-900 dark:text-white">
                  {request.status}
                </strong>
              </span>

              {request.status === "SENT" && (
                <button
                  type="button"
                  disabled={acknowledgingId === request.id}
                  onClick={() => handleAcknowledgeRevision(request.id)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {acknowledgingId === request.id
                    ? "Processing..."
                    : "Received"}
                </button>
              )}

              {request.status === "RECEIVED" && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/author/new-submission?revisionRequestId=${encodeURIComponent(request.id)}`
                    )
                  }
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  Submit Revision
                </button>
              )}

              {request.status === "SUBMITTED" && (
                <span className="rounded-lg bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                  Revision Submitted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}




        {activeTab === "submit" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manuscript Submission
              </h2>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Choose an option to start, continue,
                or manage your manuscript submission.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">

              {/* New Submission */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/author/new-submission"
                  )
                }
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                  <span className="text-2xl">
                    +
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  New Submission
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Start a new manuscript submission
                  and provide all required information.
                </p>

                <span className="mt-5 inline-flex items-center text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                  Start Submission →
                </span>
              </button>

              {/* Draft Submission */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/author/submission/drafts"
                  )
                }
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                  <span className="text-2xl">
                    ✎
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Draft Submission
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Continue incomplete manuscript
                  submissions or remove a draft you
                  no longer need.
                </p>

                <span className="mt-5 inline-flex items-center text-sm font-medium text-amber-600 group-hover:underline dark:text-amber-400">
                  View Drafts →
                </span>
              </button>

              {/* Saved Submission */}

              <button
                type="button"
                onClick={() =>
                  navigate(
                    "/author/submission/saved"
                  )
                }
                className="group rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                  <span className="text-2xl">
                    ✓
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Save Submission
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-400">
                  Access manuscripts that you have
                  saved and continue them whenever you
                  are ready.
                </p>

                <span className="mt-5 inline-flex items-center text-sm font-medium text-emerald-600 group-hover:underline dark:text-emerald-400">
                  View Saved →
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================
            FINAL PUBLICATION
        ============================================ */}

        {activeTab === "publication" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Final Publication
              </h2>

              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage your manuscripts selected for
                final publication.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                <span className="text-2xl">
                  ✓
                </span>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                Final Publication
              </h3>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-600 dark:text-gray-400">
                Manuscripts accepted for final
                publication will appear here.
              </p>
            </div>
          </div>
        )}

        {/* ============================================
            WITHDRAW
        ============================================ */}

        {activeTab === "withdraw" && (
          <div>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Withdrawn Manuscripts
                </h2>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  View withdrawal requests and
                  manuscripts that have been successfully
                  withdrawn.
                </p>
              </div>

              <button
                type="button"
                onClick={loadWithdrawalRequests}
                disabled={withdrawalLoading}
                className="w-fit rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                {withdrawalLoading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>
            </div>

            {/* Loading */}

            {withdrawalLoading && (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Loading withdrawal records...
                </p>
              </div>
            )}

            {/* Error */}

            {!withdrawalLoading &&
              withdrawalError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">
                    {withdrawalError}
                  </p>

                  <button
                    type="button"
                    onClick={
                      loadWithdrawalRequests
                    }
                    className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>
              )}

            {/* Approved Withdrawals */}

            {!withdrawalLoading &&
              !withdrawalError &&
              (() => {
                const approvedWithdrawals =
                  withdrawalRequests.filter(
                    (request) =>
                      request.status ===
                      "APPROVED"
                  );

                if (
                  approvedWithdrawals.length ===
                  0
                ) {
                  return (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-gray-900">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                        <span className="text-xl text-gray-500 dark:text-gray-400">
                          —
                        </span>
                      </div>

                      <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                        No Withdrawn Manuscripts
                      </h3>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                        Manuscripts approved for
                        withdrawal will appear here.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-5">
                    {approvedWithdrawals.map(
                      (request) => (
                        <div
                          key={request.id}
                          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold leading-7 text-gray-900 dark:text-white">
                                {
                                  request.paper
                                    .title
                                }
                              </h3>

                              <p className="mt-1 break-all font-mono text-sm text-blue-600 dark:text-blue-400">
                                {
                                  request.paper
                                    .manuscriptId
                                }
                              </p>

                              
                            {request.paper.authors && (
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="font-medium text-gray-800 dark:text-gray-200">
                                Author(s):
                              </span>{" "}
                              {formatAuthors(request.paper.authors)}
                            </p>
)}
                            </div>

                            <span className="w-fit rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              WITHDRAWN
                            </span>


                            <button
                                type="button"
                                onClick={() =>
                                  handleDeleteWithdrawnManuscript(
                                    request.paper.id
                                  )
                                }
                                className="w-fit rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                              >
                                Delete Manuscript
                              </button>

                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Requested
                              </p>

                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {formatDateTime(
                                  request.requestedAt
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Approved
                              </p>

                              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                                {request.decidedAt
                                  ? formatDateTime(
                                      request.decidedAt
                                    )
                                  : request
                                      .paper
                                      .withdrawnAt
                                  ? formatDateTime(
                                      request
                                        .paper
                                        .withdrawnAt
                                    )
                                  : "—"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Withdrawal Reason
                            </p>

                            <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                              {
                                request.reason
                              }
                            </p>
                          </div>

                          {request.editorComment && (
                            <div className="mt-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                Editor Comment
                              </p>

                              <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                                {
                                  request.editorComment
                                }
                              </p>
                            </div>
                          )}
                   
                        </div>
                      )
                    )}
                  </div>
                );
              })()}
          </div>
        )}

        {/* ============================================
            WITHDRAWAL MODAL
        ============================================ */}

        {selectedWithdrawalPaper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">

              {/* Modal Header */}

              <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Withdraw Manuscript
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Please provide a reason for
                    withdrawing your manuscript.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    closeWithdrawalModal
                  }
                  disabled={
                    withdrawalSubmitting
                  }
                  className="rounded-lg p-2 cursor-pointer text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}

              <div className="space-y-5 px-6 py-6">

                {/* Manuscript */}

                <div className="rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Manuscript
                  </p>

                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                    {
                      selectedWithdrawalPaper.title
                    }
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-blue-600 dark:text-blue-400">
                    Manuscript ID:{" "}
                    {selectedWithdrawalPaper.manuscriptId ||
                      "—"}
                  </p>

                 {selectedWithdrawalPaper.authors && (
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">
                        Author(s):
                      </span>{" "}
                      {formatAuthors(selectedWithdrawalPaper.authors)}
                    </p>
                  )}
                </div>

                {/* Warning */}

                <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/50 dark:bg-yellow-900/20">
                  <p className="text-sm leading-6 text-yellow-800 dark:text-yellow-300">
                    Your withdrawal request will be
                    sent to the Editor for review. The
                    manuscript will only be withdrawn
                    after the Editor approves your
                    request.
                  </p>
                </div>

                {/* Reason */}

                <div>
                  <label
                    htmlFor="withdrawal-reason"
                    className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                  >
                    Reason for Withdrawal{" "}
                    <span className="text-red-500">
                      *
                    </span>
                  </label>

                  <textarea
                    id="withdrawal-reason"
                    value={withdrawalReason}
                    onChange={(event) =>
                      setWithdrawalReason(
                        event.target.value
                      )
                    }
                    rows={6}
                    maxLength={2000}
                    disabled={
                      withdrawalSubmitting
                    }
                    placeholder="Please explain why you want to withdraw this manuscript..."
                    className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400"
                  />

                  <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Minimum 10 characters
                      required.
                    </span>

                    <span>
                      {withdrawalReason.length}
                      /2000
                    </span>
                  </div>
                </div>

                {/* Actions */}

                <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">

                  <button
                    type="button"
                    onClick={
                      closeWithdrawalModal
                    }
                    disabled={
                      withdrawalSubmitting
                    }
                    className="rounded-lg cursor-pointer border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleWithdrawalSubmit
                    }
                    disabled={
                      withdrawalSubmitting
                    }
                    className="rounded-lg bg-red-600 cursor-pointer px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {withdrawalSubmitting
                      ? "Submitting..."
                      : "Submit Withdrawal Request"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ============================================
// Stat Card
// ============================================

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {title}
      </p>

      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}