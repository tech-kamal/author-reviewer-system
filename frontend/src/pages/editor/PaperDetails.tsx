import { useEffect, useState } from "react";

import {

  Link,

  useNavigate,

  useParams,

} from "react-router-dom";

import {

  getPaperById,

  getRevisionData,

  getReviewDetails,

  makeFinalDecision,

  sendRevisionToAuthor,

} from "../../api/editor.api";

import type { Paper } from "../../types/paper.types";

import InviteReviewer from "./InviteReviewer";

const formatAuthors = (authors: string | null): string => {

  if (!authors) {

    return "Not available";

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

const formatDecisionLabel = (

  decision: string | null | undefined

): string => {

  if (!decision) {

    return "Pending";

  }

  const labels: Record<string, string> = {

    Submitted_To_Journal: "Submitted to Journal",

    With_Editor: "With Editor",

    Technical_Check: "Technical Check",

    Awaiting_Reviewer: "Awaiting Reviewer",

    Under_Review: "Under Review",

    MAJOR_REVISION: "Major Revision",

    MINOR_REVISION: "Minor Revision",

    RECEIVED_MAJOR_REVISION:

      "Received Major Revision",

    RECEIVED_MINOR_REVISION:

      "Received Minor Revision",

    ACCEPTED_FOR_PUBLICATION:

      "Accepted for Publication",

    Under_Production:

      "Under Production",

    GALLEY_PROOFS:

      "Galley proofs",

    AUTHOR_CORRECTIONS_GALLEY_PROOFS:

      "Author corrections - Galley proofs",

    FINAL_PUBLISHED_VERSION:

      "Final Published Version",

    WITHDRAW:

      "Withdraw",

  };

  return labels[decision] || decision;

};

type ReviewerSuggestion = {

  name?: string;

  email?: string;

  affiliation?: string;

  expertise?: string;

};

const parseReviewerSuggestions = (

  value: string | null | undefined

): ReviewerSuggestion[] => {

  if (!value) {

    return [];

  }

  try {

    const parsed = JSON.parse(value);

    if (!Array.isArray(parsed)) {

      return [];

    }

    return parsed;

  } catch {

    return [];

  }

};

function PaperDetails() {

  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();

  type PaperWithReviewerSuggestions = Paper & {

  reviewerSuggestions?: string | null;

  };

  const [paper, setPaper] =

  useState<PaperWithReviewerSuggestions | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ============================================

// Revision Request State

// ============================================

const [revisionModalOpen, setRevisionModalOpen] =

  useState(false);

  const [activeRevisionRequest, setActiveRevisionRequest] =

  useState<{

    id: string;

    revisionType: "MAJOR_REVISION" | "MINOR_REVISION";

    status: "SENT" | "RECEIVED" | "SUBMITTED";

  } | null>(null);

const [revisionType, setRevisionType] =

  useState<"MAJOR_REVISION" | "MINOR_REVISION">(

    "MAJOR_REVISION"

  );

const [revisionReport, setRevisionReport] =

  useState("");

const [selectedReviewRequestId, setSelectedReviewRequestId] =

  useState<string | null>(null);

const [revisionAttachment, setRevisionAttachment] =

  useState<File | null>(null);

  const [commentsToAuthor, setCommentsToAuthor] =

  useState("");

const [revisionLoading, setRevisionLoading] =

  useState(false);

const [revisionError, setRevisionError] =

  useState("");

const [revisionSuccess, setRevisionSuccess] =

  useState("");

const [selectedReview, setSelectedReview] =

  useState<any | null>(null);

const [reviewLoading, setReviewLoading] =

  useState(false);

const [reviewError, setReviewError] =

  useState("");

const [decision, setDecision] =

  useState("");

const [decisionLoading, setDecisionLoading] =

  useState(false);

const [decisionError, setDecisionError] =

  useState("");

  useEffect(() => {

    const loadPaper = async () => {

      if (!id) {

        setError("Paper ID is missing");

        setLoading(false);

        return;

      }

      try {

        setError("");

        const result = await getPaperById(id);

        setPaper(result.paper);

        // Load the active revision request without blocking paper details.

        try {

          const revisionResult = await getRevisionData(id);

          console.log(
              "Revision data API response:",
              revisionResult
            );

            console.log(
              "Active revision request:",
              revisionResult?.activeRevisionRequest
            );

          setActiveRevisionRequest(

            revisionResult?.activeRevisionRequest ?? null

          );

        } catch (revisionLoadError) {

          console.error(

            "Failed to load active revision request:",

            revisionLoadError

          );

          setActiveRevisionRequest(null);

        }

      } catch (error) {

        setError(

          error instanceof Error

            ? error.message

            : "Failed to load paper"

        );

      } finally {

        setLoading(false);

      }

    };

    loadPaper();

  }, [id]);

const handleViewReview = async (

  reviewRequestId: string

) => {

  try {

    setReviewLoading(true);

    setReviewError("");

    const result = await getReviewDetails(

      reviewRequestId

    );

    setSelectedReview({

      ...result.review,

      reviewRequestId,

    });

  } catch (error) {

    setReviewError(

      error instanceof Error

        ? error.message

        : "Failed to load review"

    );

  } finally {

    setReviewLoading(false);

  }

};

      const handleDownloadAttachment = async (

        attachmentPath: string,

        attachmentName: string

      ) => {

        try {

          const fileUrl =

            `http://localhost:4000/${attachmentPath.replace(/^\/+/, "")}`;

          const response = await fetch(fileUrl);

          if (!response.ok) {

            throw new Error("Failed to download attachment");

          }

          const blob = await response.blob();

          const blobUrl =

            window.URL.createObjectURL(blob);

          const link =

            document.createElement("a");

          link.href = blobUrl;

          link.download =

            attachmentName || "reviewer-attachment";

          document.body.appendChild(link);

          link.click();

          document.body.removeChild(link);

          window.URL.revokeObjectURL(blobUrl);

        } catch (error) {

          console.error(

            "Download attachment error:",

            error

          );

          alert("Unable to download attachment.");

        }

      };

const handleSendRevision = async () => {

  if (!id) {

    setRevisionError("Paper ID is missing");

    return;

  }

  if (!selectedReviewRequestId) {

    setRevisionError(

      "Review request is missing"

    );

    return;

  }

  if (!revisionType) {

    setRevisionError(

      "Please select a revision type"

    );

    return;

  }

  if (!revisionReport.trim()) {

    setRevisionError(

      "Reviewer report is required"

    );

    return;

  }

  try {

    setRevisionLoading(true);

    setRevisionError("");

    setRevisionSuccess("");

    const revisionResult = await sendRevisionToAuthor(

      id,

      selectedReviewRequestId,

      revisionType,

      revisionReport.trim(),

      commentsToAuthor.trim(),

      revisionAttachment

    );

    setActiveRevisionRequest({

      id:

        revisionResult?.revisionRequest?.id ??

        revisionResult?.id ??

        "pending-refresh",

      revisionType:

        revisionResult?.revisionRequest?.revisionType ?? revisionType,

      status: revisionResult?.revisionRequest?.status ?? "SENT",

    });

    setRevisionModalOpen(false);

    setPaper((currentPaper) =>

      currentPaper

        ? {

            ...currentPaper,

            editorialDecision: revisionType,

            decisionAt: new Date().toISOString(),

          }

        : currentPaper

    );

    navigate("/editor/revision-sent", {

      state: {

        paperId: id,

        manuscriptId:

          paper?.manuscriptId || "Not available",

        title:

          paper?.title || "Not available",

        revisionType,

        reviewReport: revisionReport.trim(),

        commentsToAuthor:

          commentsToAuthor.trim(),

        sentAt: new Date().toISOString(),

      },

    });

  } catch (error) {

    console.error(

      "Send revision error:",

      error

    );

    setRevisionError(

      error instanceof Error

        ? error.message

        : "Failed to send revision to author"

    );

  } finally {

    setRevisionLoading(false);

  }

};

const handleFinalDecision = async () => {

  if (!id) {

    setDecisionError("Paper ID is missing");

    return;

  }

  if (!decision) {

    setDecisionError("Please select a final decision");

    return;

  }

  try {

    setDecisionLoading(true);

    setDecisionError("");

    await makeFinalDecision(

      id,

      decision

    );

    setPaper((currentPaper) =>

      currentPaper

        ? {

            ...currentPaper,

            editorialDecision: decision,

            decisionAt: new Date().toISOString(),

          }

        : currentPaper

    );

  } catch (error) {

    setDecisionError(

      error instanceof Error

        ? error.message

        : "Failed to save final decision"

    );

  } finally {

    setDecisionLoading(false);

  }

};

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">

        <p className="text-gray-600 dark:text-gray-400">

          Loading paper...

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

            to="/editor/papers"

            className="mt-5 inline-block text-blue-600 hover:text-blue-700 dark:text-blue-400"

          >

            ← Back to My Papers

          </Link>

        </div>

      </div>

    );

  }

  if (!paper) {

    return null;

  }

  const reviewerSuggestions = parseReviewerSuggestions(

    paper.reviewerSuggestions

  );

  return (

    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">

      <div className="mx-auto max-w-5xl">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <div>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">

              Paper Details

            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">

              View your submitted research paper.

            </p>

          </div>

          <Link

            to="/editor/papers"

            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"

          >

            Back to Papers

          </Link>

        </div>

        {/* Paper Information */}

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

            Manuscript ID

          </p>

          <p className="mt-1 text-sm font-semibold text-blue-600 dark:text-blue-400">

            {paper.manuscriptId || "Not available"}

          </p>

        </div>

        <div className="mb-4">

          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

            Author(s)

          </p>

          <p className="mt-1 text-sm font-semibold text-gray-700 dark:text-gray-300">

            {formatAuthors(paper.authors ?? null)}

          </p>

        </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">

            {paper.title}

          </h2>

          <div className="mt-6">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

              Abstract

            </h3>

            <p className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">

              {paper.abstract || "No abstract provided."}

            </p>

          </div>

          <div className="mt-6">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

              Keywords

            </h3>

            <p className="mt-2 text-gray-700 dark:text-gray-300">

              {paper.keywords || "No keywords provided."}

            </p>

          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">

                Created

              </p>

              <p className="mt-1 text-sm text-gray-900 dark:text-white">

                {new Date(

                  paper.createdAt

                ).toLocaleString()}

              </p>

            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">

              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">

                Decision

              </p>

              <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">

                {formatDecisionLabel(paper.editorialDecision)}

              </p>

            </div>

          </div>

          {/* PDF */}

          {paper.pdfPath && (

            <div className="mt-8">

              <a

                href={`http://localhost:4000/${paper.pdfPath.replace(

                  /^\/+/,

                  ""

                )}`}

                target="_blank"

                rel="noopener noreferrer"

                className="inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"

              >

                Open PDF

              </a>

            </div>

          )}

        </div>

                {/* Reviewer Suggestions */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                Reviewer Suggestions

              </h2>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

                Reviewers suggested by the author for this manuscript.

              </p>

            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">

              {reviewerSuggestions.length}

            </span>

          </div>

          {reviewerSuggestions.length > 0 ? (

            <div className="mt-6 space-y-4">

              {reviewerSuggestions.map(

                (reviewer, index) => (

                  <div

                    key={`${reviewer.email || reviewer.name || "reviewer"}-${index}`}

                    className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"

                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">

                          {reviewer.name || "Name not provided"}

                        </h3>

                        {reviewer.email && (

                          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

                            {reviewer.email}

                          </p>

                        )}

                      </div>

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">

                        Suggested Reviewer

                      </span>

                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                          Affiliation

                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">

                          {reviewer.affiliation ||

                            "Not provided"}

                        </p>

                      </div>

                      <div>

                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                          Expertise

                        </p>

                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">

                          {reviewer.expertise ||

                            "Not provided"}

                        </p>

                      </div>

                    </div>

                  </div>

                )

              )}

            </div>

          ) : (

            <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-400">

              No reviewer suggestions were provided by the author.

            </div>

          )}

        </div>

        {/* Review Requests */}

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                Review Requests

              </h2>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

                Reviewers assigned to this paper.

              </p>

            </div>

            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">

              {paper.reviewRequests?.length || 0}

            </span>

          </div>

            {/* Invite Reviewer */}

            <InviteReviewer

                paperId={paper.id}

                onSuccess={() => {

                window.location.reload();

                }}

            />

           {/* Existing Review Requests */}

          {paper.reviewRequests &&

          paper.reviewRequests.length > 0 ? (

            <div className="mt-6 space-y-4">

              {paper.reviewRequests.map(

                (request) => (

                  <div

                    key={request.id}

                    className="rounded-xl border border-gray-200 p-5 dark:border-gray-800"

                  >

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                      <div>

                        <h3 className="font-semibold text-gray-900 dark:text-white">

                          {request.reviewer.name}

                        </h3>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

                          {request.reviewer.email}

                        </p>

                      </div>

                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-400">

                        {request.status}

                      </span>

                    </div>

                    {request.dueDate && (

                      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">

                        Due:{" "}

                        {new Date(

                          request.dueDate

                        ).toLocaleDateString()}

                      </p>

                    )}

                     {request.status ===

                      "REVIEW_SUBMITTED" && (

                      <button

                        type="button"

                        onClick={() =>

                          handleViewReview(request.id)

                        }

                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"

                      >

                        View Review

                      </button>

                    )}

                  </div>

                )

              )}

            </div>

          ) : (

            <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center text-gray-600 dark:bg-gray-800 dark:text-gray-400">

              No reviewers have been invited yet.

            </div>

          )}

        </div>

      {/* Selected Review */}

      {selectedReview && (

        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          {revisionSuccess && (

            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">

              {revisionSuccess}

            </div>

          )}

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                Reviewer Report

              </h2>

              {/* =====================================================

                  SEND REVISION TO AUTHOR

              ===================================================== */}

              <div className="mt-6 border-t border-gray-200 pt-5">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  {/* Heading */}

                  <div>

                    <h3 className="text-base font-semibold text-gray-900">

                      Send Revision to Author

                    </h3>

                    <p className="mt-1 text-sm text-gray-500">

                      Send the edited reviewer report to the author

                      for revision.

                    </p>

                  </div>

                  {/* Buttons */}

                  <div className="flex flex-wrap gap-3">

                    {activeRevisionRequest ? (

                      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">

                        {activeRevisionRequest.revisionType === "MAJOR_REVISION"

                          ? "Major Revision"

                          : "Minor Revision"}{" "}

                        sent successfully.

                      </div>

                    ) : (

                      <>

                        {/* Major Revision */}

                        <button

                          type="button"

                          onClick={() => {

                            setRevisionType("MAJOR_REVISION");

                            setSelectedReviewRequestId(

                              selectedReview?.reviewRequestId || null

                            );

                            setRevisionReport(

                              selectedReview?.commentsToAuthor || ""

                            );

                            setCommentsToAuthor("");

                            setRevisionAttachment(null);

                            setRevisionError("");

                            setRevisionSuccess("");

                            setRevisionModalOpen(true);

                          }}

                          className="

                            inline-flex items-center justify-center rounded-lg

                            border border-red-300 bg-white px-4 py-2.5

                            text-sm font-semibold text-red-600 shadow-sm

                            transition hover:bg-red-50 focus:outline-none

                            focus:ring-2 focus:ring-red-500 focus:ring-offset-2

                          "

                        >

                          Send Major Revision

                        </button>

                        {/* Minor Revision */}

                        <button

                          type="button"

                          onClick={() => {

                            setRevisionType("MINOR_REVISION");

                            setSelectedReviewRequestId(

                              selectedReview?.reviewRequestId || null

                            );

                            setRevisionReport(

                              selectedReview?.commentsToAuthor || ""

                            );

                            setCommentsToAuthor("");

                            setRevisionAttachment(null);

                            setRevisionError("");

                            setRevisionSuccess("");

                            setRevisionModalOpen(true);

                          }}

                          className="

                            inline-flex items-center justify-center rounded-lg

                            border border-blue-300 bg-white px-4 py-2.5

                            text-sm font-semibold text-blue-600 shadow-sm

                            transition hover:bg-blue-50 focus:outline-none

                            focus:ring-2 focus:ring-blue-500 focus:ring-offset-2

                          "

                        >

                          Send Minor Revision

                        </button>

                      </>

                    )}

                  </div>

                </div>

              </div>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

                Submitted review details.

              </p>

            </div>

            <button

              type="button"

              onClick={() =>

                setSelectedReview(null)

              }

              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"

            >

              Close

            </button>

          </div>

          {reviewLoading && (

            <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">

              Loading review...

            </p>

          )}

          {reviewError && (

            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">

              {reviewError}

            </div>

          )}

          {!reviewLoading && !reviewError && (

            <div className="mt-6 space-y-6">

              {/* Recommendation */}

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                  Recommendation

                </h3>

                <p className="mt-2 rounded-lg bg-gray-50 p-4 font-medium text-gray-900 dark:bg-gray-800 dark:text-white">

                  {selectedReview.recommendation ||

                    "Not provided"}

                </p>

              </div>

              {/* Comments to Author */}

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                  Comments to Author

                </h3>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">

                  <p className="whitespace-pre-wrap">

                    {selectedReview.commentsToAuthor ||

                      "No comments provided."}

                  </p>

                </div>

              </div>

              {/* Confidential Comments */}

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                  Confidential Comments to Editor

                </h3>

                <div className="mt-2 rounded-lg bg-gray-50 p-4 text-gray-700 dark:bg-gray-800 dark:text-gray-300">

                  <p className="whitespace-pre-wrap">

                    {selectedReview.commentsToEditor ||

                      "No confidential comments provided."}

                  </p>

                </div>

              </div>

              {/* Reviewer Attachment */}

                {selectedReview.attachmentPath && (

                  <div>

                    <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                      Reviewer Attachment

                    </h3>

                    <div className="mt-2 flex flex-col gap-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-800 sm:flex-row sm:items-center sm:justify-between">

                      <div>

                        <p className="font-medium text-gray-900 dark:text-white">

                          {selectedReview.attachmentName ||

                            "Reviewer attachment"}

                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">

                          Additional file submitted by the reviewer.

                        </p>

                      </div>

                      <div className="flex gap-2">

                        <a

                          href={`http://localhost:4000/${selectedReview.attachmentPath.replace(

                            /^\/+/,

                            ""

                          )}`}

                          target="_blank"

                          rel="noopener noreferrer"

                          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"

                        >

                          View

                        </a>

                        {/* <a

                          href={`http://localhost:4000/${selectedReview.attachmentPath.replace(

                            /^\/+/,

                            ""

                          )}`}

                          download={

                            selectedReview.attachmentName ||

                            "reviewer-attachment"

                          }

                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"

                        >

                          Download

                        </a> */}

                        <button

                              type="button"

                              onClick={() =>

                                handleDownloadAttachment(

                                  selectedReview.attachmentPath,

                                  selectedReview.attachmentName ||

                                    "reviewer-attachment"

                                )

                              }

                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"

                            >

                              Download

                        </button>

                      </div>

                    </div>

                  </div>

                )}

              {/* Submitted Date */}

              <div>

                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">

                  Submitted At

                </h3>

                <p className="mt-2 text-sm text-gray-900 dark:text-white">

                  {selectedReview.submittedAt

                    ? new Date(

                        selectedReview.submittedAt

                      ).toLocaleString()

                    : "Not available"}

                </p>

              </div>

            </div>

          )}

        </div>

      )}

      {/* ============================================================

          REVISION REQUEST MODAL

      ============================================================ */}

      {revisionModalOpen && (

        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4">

          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">

              <div>

                <h2 className="text-xl font-bold text-gray-900">

                  Send Revision to Author

                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  Review and edit the received reviewer report before sending it

                  to the author.

                </p>

              </div>

              <button

                type="button"

                onClick={() => {

                  setRevisionModalOpen(false);

                  setRevisionError("");

                }}

                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"

              >

                ✕

              </button>

            </div>

            <div className="space-y-6 p-6">

              {/* Error */}

              {revisionError && (

                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                  {revisionError}

                </div>

              )}

              {/* Success */}

              {revisionSuccess && (

                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">

                  {revisionSuccess}

                </div>

              )}

              {/* Manuscript Information */}

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-700">

                  Manuscript Information

                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  {/* Manuscript ID */}

                  <div>

                    <label className="mb-1 block text-sm font-medium text-gray-700">

                      Manuscript ID

                    </label>

                    <input

                      type="text"

                      value={paper?.manuscriptId || paper?.id || ""}

                      readOnly

                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm text-gray-700 outline-none"

                    />

                  </div>

                  {/* Revision Type */}

                  <div>

                    <label className="mb-1 block text-sm font-medium text-gray-700">

                      Revision Type

                    </label>

                    <input

                      type="text"

                      value={

                        revisionType === "MAJOR_REVISION"

                          ? "Major Revision"

                          : "Minor Revision"

                      }

                      readOnly

                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 outline-none"

                    />

                  </div>

                </div>

              </div>

              {/* ======================================================

                  REVIEWER REPORT

              ====================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">

                  Reviewer Report

                  <span className="ml-1 text-red-500">*</span>

                </label>

                <p className="mb-2 text-xs text-gray-500">

                  The editor can correct formatting, language, and content before

                  sending the report to the author.

                </p>

                <textarea

                  value={revisionReport}

                  onChange={(e) => setRevisionReport(e.target.value)}

                  rows={12}

                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

                  placeholder="Enter or edit the reviewer report..."

                />

              </div>

              {/* ======================================================

                  COMMENTS TO AUTHOR

              ====================================================== */}

              <div>

                <label className="mb-2 block text-sm font-semibold text-gray-800">

                  Comments to Author

                </label>

                <p className="mb-2 text-xs text-gray-500">

                  These comments will be visible to the author. The editor can

                  correct or rewrite them before sending.

                </p>

                <textarea

                  value={commentsToAuthor}

                  onChange={(e) => setCommentsToAuthor(e.target.value)}

                  rows={8}

                  className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"

                  placeholder="Enter or edit comments to the author..."

                />

              </div>

              {/* ======================================================

                  REVIEWER ATTACHMENT

              ====================================================== */}

                        {/* ======================================================

              REVIEWER FILE

          ====================================================== */}

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">

            <div className="mb-4">

              <h3 className="text-sm font-semibold text-gray-800">

                Reviewer File

              </h3>

              <p className="mt-1 text-xs text-gray-500">

                The reviewer file can be viewed and, if necessary,

                replaced by the editor before sending the revision to the author.

              </p>

            </div>

            {/* Existing reviewer file */}

            {selectedReview?.attachmentPath ? (

              <div className="rounded-lg border border-gray-200 bg-white p-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div className="min-w-0">

                    <p className="break-all text-sm font-medium text-gray-800">

                      {selectedReview.attachmentName ||

                        "Reviewer attachment"}

                    </p>

                    <p className="mt-1 text-xs text-gray-500">

                      Original file submitted by the reviewer

                    </p>

                  </div>

                  <div className="flex shrink-0 gap-2">

                    {/* View File */}

                    <a

                      href={`http://localhost:4000/${selectedReview.attachmentPath.replace(

                        /^\/+/,

                        ""

                      )}`}

                      target="_blank"

                      rel="noopener noreferrer"

                      className="rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"

                    >

                      View File

                    </a>

                    {/* Download File */}

                    <button

                      type="button"

                      onClick={() =>

                        handleDownloadAttachment(

                          selectedReview.attachmentPath,

                          selectedReview.attachmentName ||

                            "reviewer-attachment"

                        )

                      }

                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"

                    >

                      Download

                    </button>

                  </div>

                </div>

              </div>

            ) : (

              <div className="rounded-lg border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-500">

                No reviewer file was submitted.

              </div>

            )}

            {/* Replace reviewer file */}

            <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">

              <label className="mb-2 block text-sm font-semibold text-gray-700">

                Replace Reviewer File

              </label>

              <p className="mb-3 text-xs text-gray-500">

                Select a new file only if the original reviewer file

                needs correction or replacement.

              </p>

              <input

                type="file"

                onChange={(e) => {

                  const file = e.target.files?.[0] || null;

                  setRevisionAttachment(file);

                }}

                className="block w-full cursor-pointer rounded-lg border border-gray-300 bg-white text-sm text-gray-700 file:mr-4 file:border-0 file:bg-indigo-600 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-700"

              />

              {revisionAttachment && (

                <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">

                  <div className="min-w-0">

                    <p className="break-all text-sm font-medium text-indigo-800">

                      {revisionAttachment.name}

                    </p>

                    <p className="mt-1 text-xs text-indigo-600">

                      New reviewer file selected

                    </p>

                  </div>

                  <button

                    type="button"

                    onClick={() => {

                      setRevisionAttachment(null);

                    }}

                    className="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"

                  >

                    Remove

                  </button>

                </div>

              )}

            </div>

          </div>

              {/* ======================================================

                  CONFIDENTIAL NOTE

              ====================================================== */}

              {/* <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                <div className="flex gap-3">

                  <div className="text-amber-600">

                    ⚠

                  </div>

                  <div>

                    <p className="text-sm font-semibold text-amber-800">

                      Confidential Reviewer Information

                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">

                      Confidential comments to the editor are not included in the

                      revision request sent to the author.

                    </p>

                  </div>

                </div>

              </div> */}

            </div>

            {/* ========================================================

                FOOTER

            ======================================================== */}

            <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t bg-white px-6 py-4">

              <button

                type="button"

                disabled={revisionLoading}

                onClick={() => {

                  setRevisionModalOpen(false);

                  setRevisionError("");

                }}

                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"

              >

                Cancel

              </button>

              <button

                type="button"

                disabled={revisionLoading}

                onClick={handleSendRevision}

                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"

              >

                {revisionLoading

                  ? "Sending..."

                  : revisionType === "MAJOR_REVISION"

                    ? "Send Major Revision"

                    : "Send Minor Revision"}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* Final Decision */}

      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

        <div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">

            Final Decision

          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">

            Select the final editorial decision for this paper.

          </p>

        </div>

        <div className="mt-6">

          <label

            htmlFor="finalDecision"

            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"

          >

            Decision

          </label>

          <select

            id="finalDecision"

            value={

              decision ||

              paper.editorialDecision ||

              ""

            }

            onChange={(event) =>

              setDecision(event.target.value)

            }

            className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"

          >

              <option value="">

                Select editorial status

              </option>

              <option value="Submitted_To_Journal">

                Submitted to Journal

              </option>

              <option value="With_Editor">

                With Editor

              </option>

              <option value="Technical_Check">

                Technical Check

              </option>

              <option value="Awaiting_Reviewer">

                Awaiting Reviewer

              </option>

              <option value="Under_Review">

                Under Review

              </option>

              <option value="MAJOR_REVISION">

                Major Revision

              </option>

              <option value="MINOR_REVISION">

                Minor Revision

              </option>

              <option value="RECEIVED_MAJOR_REVISION">

                Received Major Revision

              </option>

              <option value="RECEIVED_MINOR_REVISION">

                Received Minor Revision

              </option>

              <option value="ACCEPTED_FOR_PUBLICATION">

                Accepted for Publication

              </option>

              <option value="Under_Production">

                Under Production

              </option>

              <option value="GALLEY_PROOFS">

                Galley proofs

              </option>

              <option value="AUTHOR_CORRECTIONS_GALLEY_PROOFS">

                Author corrections - Galley proofs

              </option>

              <option value="FINAL_PUBLISHED_VERSION">

                Final Published Version

              </option>

              <option value="WITHDRAW">

                Withdraw

              </option>

          </select>

        </div>

        {decisionError && (

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">

            {decisionError}

          </div>

        )}

        <div className="mt-6 flex items-center justify-between gap-4">

          <div>

            <p className="text-sm text-gray-500 dark:text-gray-400">

              Current Decision

            </p>

            <p className="mt-1 font-semibold text-gray-900 dark:text-white">

              {formatDecisionLabel(paper.editorialDecision)}

            </p>

          </div>

          <button

            type="button"

            onClick={handleFinalDecision}

            disabled={decisionLoading}

            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"

          >

            {decisionLoading

              ? "Saving..."

              : "Save Final Decision"}

          </button>

        </div>

        {paper.decisionAt && (

          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">

            Decision made on:{" "}

            {new Date(

              paper.decisionAt

            ).toLocaleString()}

          </p>

        )}

        </div>

      </div>

    </div>

  );

}

export default PaperDetails;
