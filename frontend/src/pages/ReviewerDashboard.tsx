import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";


import {
  getStoredUser,
  getToken,
} from "../auth/auth.storage";

interface Author {
  ID?: string | number;
  NAME?: string;
  EMAIL?: string;
  AFFILIATION?: string;
  ROLE?: string;
}

interface Paper {
  id: string;
  manuscriptId?: string | null;
  authors?: string | Author[] | null;
  title: string;
  abstract: string | null;
  keywords: string | null;
  pdfPath: string | null;
  createdAt: string;
}

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
  dueDate: string | null;
  invitedAt: string;
  respondedAt: string | null;
  declineReason?: string | null;
  paper: Paper;
  review?: Review | null;
}

function ReviewerDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [reviewRequests, setReviewRequests] = useState<
    ReviewRequest[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // const [actionLoading, setActionLoading] = useState<string | null>(null);

  // const [declineRequest, setDeclineRequest] =
  //   useState<ReviewRequest | null>(null);

  // const [declineReason, setDeclineReason] = useState("");

useEffect(() => {
  const loadReviewRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        navigate("/login", {
          replace: true,
        });
        return;
      }

      const response = await api.get(
        "/reviewer/review-requests",
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
            "Unable to load review requests."
        );
      }

      setReviewRequests(
        result.reviewRequests || []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to load review requests."
      );
    } finally {
      setLoading(false);
    }
  };

  loadReviewRequests();
}, [navigate]);


const parseAuthors = (
  authors: string | Author[] | null | undefined
): Author[] => {
  if (!authors) {
    return [];
  }

  let parsedAuthors: any = authors;

  // JSON string -> array/object
  if (typeof authors === "string") {
    try {
      parsedAuthors = JSON.parse(authors);
    } catch (error) {
      console.error("Unable to parse authors:", error);
      return [];
    }
  }

  // If backend returns an object containing authors
  if (!Array.isArray(parsedAuthors)) {
    if (Array.isArray(parsedAuthors?.authors)) {
      parsedAuthors = parsedAuthors.authors;
    } else {
      return [];
    }
  }

  // Normalize uppercase/lowercase field names
  return parsedAuthors.map((author: any) => ({
    ID: author.ID ?? author.id ?? author.Id,
    NAME:
      author.NAME ??
      author.name ??
      author.Name ??
      author.fullName ??
      author.full_name ??
      "",
    EMAIL:
      author.EMAIL ??
      author.email ??
      author.Email ??
      "",
    AFFILIATION:
      author.AFFILIATION ??
      author.affiliation ??
      author.Affiliation ??
      "",
    ROLE:
      author.ROLE ??
      author.role ??
      author.Role ??
      "",
  }));
};


  const formatDate = (
    date: string | null
  ) => {
    if (!date) {
      return "Not specified";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const getStatusClass = (
    status: string
  ) => {
    switch (status) {
      case "INVITED":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400";

      case "ACCEPTED":
        return "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400";

      case "DECLINED":
        return "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400";

      case "REVIEW_SUBMITTED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPdfUrl = (
    pdfPath: string | null
  ) => {
    if (!pdfPath) {
      return null;
    }

    if (pdfPath.startsWith("http")) {
      return pdfPath;
    }

    const apiUrl =
      import.meta.env.VITE_API_URL || "";

    const baseUrl = apiUrl.replace(
      /\/api\/?$/,
      ""
    );

    return `${baseUrl}/${pdfPath.replace(
      /^\/+/,
      ""
    )}`;
  };


  const downloadPdf = async (
  pdfPath: string | null,
  paperTitle: string
) => {
  const pdfUrl = getPdfUrl(pdfPath);

  if (!pdfUrl) {
    return;
  }

  try {
    const response = await fetch(pdfUrl);

    if (!response.ok) {
      throw new Error("Unable to download PDF");
    }

    const blob = await response.blob();

    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = blobUrl;

    link.download = `${paperTitle}.pdf`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("PDF DOWNLOAD ERROR:", error);

    alert("Unable to download PDF.");
  }
};

  // ============================================
  // Categorize requests
  // ============================================

  const pendingRequests =
    reviewRequests.filter(
      (request) =>
        request.status === "INVITED"
    );

  const acceptedRequests =
    reviewRequests.filter(
      (request) =>
        request.status === "ACCEPTED"
    );

  const submittedRequests =
    reviewRequests.filter(
      (request) =>
        // request.status === "SUBMITTED"
      request.status === "REVIEW_SUBMITTED"
    );

  const declinedRequests =
    reviewRequests.filter(
      (request) =>
        request.status === "DECLINED"
    );

  return (
   <div className="w-full bg-gray-50 dark:bg-gray-950">
      <main className="mx-auto min-h-[calc(100vh-160px)] w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}
          </h2>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage your assigned research paper
            reviews from this dashboard.
          </p>

        </div>

        {/* ============================================
            Statistics
        ============================================ */}

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* Pending */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Invitations
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {pendingRequests.length}
            </p>

          </div>

          {/* Accepted */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Accepted
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {acceptedRequests.length}
            </p>

          </div>

          {/* Submitted */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Submitted
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">
              {submittedRequests.length}
            </p>

          </div>

          {/* Declined */}

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Declined
            </p>

            <p className="mt-2 text-3xl font-bold text-red-600 dark:text-red-400">
              {declinedRequests.length}
            </p>

          </div>

        </div>

        {/* ============================================
            Loading
        ============================================ */}

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Loading review requests...
            </p>

          </div>
        )}

        {/* ============================================
            Error
        ============================================ */}

        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
            {error}
          </div>
        )}

        {/* ============================================
            Pending Invitations
        ============================================ */}

        {!loading &&
          !error &&
          pendingRequests.length > 0 && (
            <section className="mb-8">

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Pending Invitations
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review invitations waiting for your response.
                </p>
              </div>

              <div className="space-y-4">

                {pendingRequests.map(
                  (request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >

                     <div className="flex flex-col gap-6">
                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-3">

                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                              Manuscript ID: {request.paper.manuscriptId || "Not available"}
                            </p>

                            <div className="mb-3">
  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
    Author(s)
  </p>

  <div className="space-y-2">
    {parseAuthors(request.paper.authors).length > 0 ? (
      parseAuthors(request.paper.authors).map((author, index) => (
        <div
          key={author.ID || index}
          className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {author.NAME || "Unnamed Author"}

            {author.ROLE && (
              <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                ({author.ROLE})
              </span>
            )}
          </p>

          {author.AFFILIATION && (
            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {author.AFFILIATION}
            </p>
          )}
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Not available
      </p>
    )}
  </div>
</div>

                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {request.paper.title}
                            </h4>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>

                          </div>

                          <p className="mt-3 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {request.paper.abstract ||
                              "No abstract available."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">

                            <span>
                              Invited:{" "}
                              {formatDate(
                                request.invitedAt
                              )}
                            </span>

                            <span>
                              Due:{" "}
                              {formatDate(
                                request.dueDate
                              )}
                            </span>

                          </div>

                        </div>

                        <div className="flex shrink-0 flex-wrap gap-3">

                          <button
                            type="button"
                            onClick={() => {
                              const pdfUrl =
                                getPdfUrl(
                                  request.paper.pdfPath
                                );

                              if (pdfUrl) {
                                window.open(
                                  pdfUrl,
                                  "_blank"
                                );
                              }
                            }}
                            disabled={
                              !request.paper.pdfPath
                            }
                            className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                          >
                            View PDF
                          </button>

                          <button
                            type="button"
                          onClick={() =>
                            downloadPdf(
                              request.paper.pdfPath,
                              request.paper.title
                            )
                            }
                            disabled={
                              !request.paper.pdfPath
                            }
                            className="rounded-lg bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            Download PDF
                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>
          )}

        {/* ============================================
            Accepted Reviews
        ============================================ */}

        {!loading &&
          !error &&
          (acceptedRequests.length > 0 ||
            submittedRequests.length > 0) && (
            <section className="mb-8">

              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  My Reviews
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Papers you have accepted for review.
                </p>
              </div>

              <div className="space-y-4">

                {[
                  ...acceptedRequests,
                  ...submittedRequests,
                ].map((request) => (
                 <div
                  key={request.id}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* =====================================================
                      MANUSCRIPT ID
                  ====================================================== */}
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    Manuscript ID:{" "}
                    {request.paper.manuscriptId || "Not available"}
                  </p>

                  {/* =====================================================
                      TITLE
                  ====================================================== */}
                  <h4 className="mt-3 text-xl font-bold leading-snug text-gray-900 dark:text-white">
                    {request.paper.title}
                  </h4>

                  {/* =====================================================
                      AUTHORS + ACTION BUTTONS
                  ====================================================== */}
                  <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                    
                    {/* ===================================================
                        AUTHORS
                    ==================================================== */}
                    <div className="min-w-0">
                      
                      <div className="mb-3 flex items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Authors
                        </span>

                        <span className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {parseAuthors(request.paper.authors).length > 0 ? (
                          parseAuthors(request.paper.authors).map(
                            (author, index) => (
                              <div
                                key={author.ID || index}
                                className="rounded-xl border border-gray-200 bg-gray-50/80 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50"
                              >
                                <div className="flex items-start gap-3">
                                  
                                  {/* AUTHOR INITIAL */}
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                                    {(author.NAME || "A")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>

                                  {/* AUTHOR INFORMATION */}
                                  <div className="min-w-0">
                                    
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {author.NAME || "Author"}
                                    </p>

                                    {author.ROLE && (
                                      <p className="mt-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                                        {author.ROLE}
                                      </p>
                                    )}

                                    {author.AFFILIATION && (
                                      <p className="mt-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                        {author.AFFILIATION}
                                      </p>
                                    )}

                                  </div>
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Author information not available.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* ===================================================
                        ACTION BUTTONS
                    ==================================================== */}
                    <div className="flex  flex-wrap items-center justify-center mt-5 gap-2 lg:justify-end">
                      
                      {/* VIEW PDF */}
                      <button
                        type="button"
                        onClick={() => {
                          const pdfUrl = getPdfUrl(
                            request.paper.pdfPath
                          );

                          if (pdfUrl) {
                            window.open(pdfUrl, "_blank");
                          }
                        }}
                        disabled={!request.paper.pdfPath}
                        className="rounded-lg cursor-pointer border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                      >
                        View PDF
                      </button>

                      {/* DOWNLOAD PDF */}
                      <button
                        type="button"
                        onClick={() =>
                          downloadPdf(
                            request.paper.pdfPath,
                            request.paper.title
                          )
                        }
                        disabled={!request.paper.pdfPath}
                        className="rounded-lg cursor-pointer bg-gray-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Download PDF
                      </button>

                      {/* WRITE REVIEW */}
                      {request.status === "ACCEPTED" && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/reviewer/review/${request.id}`
                            )
                          }
                          className="rounded-lg cursor-pointer bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          Write Review
                        </button>
                      )}

                      {/* VIEW REVIEW */}
                      {request.status === "REVIEW_SUBMITTED" && (
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/reviewer/review/${request.id}/view`
                            )
                          }
                          className="rounded-lg border border-blue-300 px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/30"
                        >
                          View Review
                        </button>
                      )}
                    </div>
                  </div>

                  {/* =====================================================
                      STATUS
                  ====================================================== */}
                  <div className="mt-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  {/* =====================================================
                      ABSTRACT
                  ====================================================== */}
                  <p className="mt-4 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {request.paper.abstract ||
                      "No abstract available."}
                  </p>

                  {/* =====================================================
                      DATES
                  ====================================================== */}
                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>
                      Due:{" "}
                      {formatDate(request.dueDate)}
                    </span>

                    <span>
                      Accepted:{" "}
                      {formatDate(request.respondedAt)}
                    </span>
                  </div>
                </div>
                ))}

              </div>

            </section>
          )}

        {/* ============================================
            Declined
        ============================================ */}

        {!loading &&
          !error &&
          declinedRequests.length > 0 && (
            <section className="mb-8">

              <div className="mb-4">

                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Declined Invitations
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review invitations you have declined.
                </p>

              </div>

              <div className="space-y-4">

                {declinedRequests.map(
                  (request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                          Manuscript ID: {request.paper.manuscriptId || "Not available"}
                        </p>

                      <div className="mb-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Author(s)
                </p>

                <div className="space-y-2">
                  {parseAuthors(request.paper.authors).length > 0 ? (
                    parseAuthors(request.paper.authors).map((author, index) => (
                      <div
                        key={author.ID || index}
                        className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50"
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {author.NAME || "Unnamed Author"}

                          {author.ROLE && (
                            <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400">
                              ({author.ROLE})
                            </span>
                          )}
                        </p>

                        {author.AFFILIATION && (
                          <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                            {author.AFFILIATION}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Not available
                    </p>
                  )}
                </div>
              </div>
                                        <h4 className="font-bold text-gray-900 dark:text-white">
                                          {request.paper.title}
                                        </h4>

                                        {request.declineReason && (
                                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                            Reason:{" "}
                                            {request.declineReason}
                                          </p>
                                        )}

                                      </div>

                                      <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                                          request.status
                                        )}`}
                                      >
                                        DECLINED
                                      </span>

                                    </div>

                                  </div>
                                )
                              )}

                            </div>

                          </section>
                        )}

                      {/* ============================================
                          Empty state
                      ============================================ */}

                      {!loading &&
                        !error &&
                        reviewRequests.length === 0 && (
                          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900">

                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-2xl dark:bg-gray-800">
                              📄
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-gray-900 dark:text-white">
                              No Review Requests
                            </h3>

                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                              You currently have no research papers
                              assigned for review.
                            </p>

                          </div>
                        )}
      </main>
    </div>
  );
}

export default ReviewerDashboard;