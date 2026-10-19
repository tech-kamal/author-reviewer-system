import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getMySubmissions } from "../../submission/submission-draft.api";

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

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatAuthors = (authors: string | null) => {
  if (!authors) return "—";

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

const formatKeywords = (keywords: string | null) => {
  if (!keywords) return [];

  return keywords
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
};

const getDecisionLabel = (decision: string | null) => {
  if (!decision) return "Under Editorial Review";

  switch (decision) {
    case "ACCEPT":
      return "Accepted";

    case "MINOR_REVISION":
      return "Minor Revision";

    case "MAJOR_REVISION":
      return "Major Revision";

    case "REJECT":
      return "Rejected";

    default:
      return decision;
  }
};

const getDecisionClass = (decision: string | null) => {
  if (!decision) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300";
  }

  switch (decision) {
    case "ACCEPT":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300";

    case "MINOR_REVISION":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300";

    case "MAJOR_REVISION":
      return "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300";

    case "REJECT":
      return "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300";

    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function AuthorSubmissionDetails() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [submission, setSubmission] =
    useState<Submission | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubmission = async () => {
      if (!id) {
        setError("Submission ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const result = await getMySubmissions();

        const foundSubmission =
          result.submissions?.find(
            (item) => item.id === id
          );

        if (!foundSubmission) {
          setError("Manuscript not found.");
          setSubmission(null);
          return;
        }

        setSubmission(foundSubmission);
      } catch (err) {
        console.error(
          "Failed to load manuscript details:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load manuscript details."
        );
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-gray-600 dark:text-gray-400">
              Loading manuscript details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6 flex justify-end">
            <button
              type="button"
              onClick={() =>
                navigate("/author/submission/saved")
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              ← Back to Saved Submissions
            </button>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-900 dark:bg-red-950/40">
            <h1 className="text-lg font-semibold text-red-700 dark:text-red-300">
              Unable to Load Manuscript
            </h1>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error || "Manuscript not found."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const keywords = formatKeywords(
    submission.keywords
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Author Workspace
            </p>

            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
              Manuscript Details
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/author/submission/saved")
            }
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back to Saved Submissions
          </button>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Manuscript Header */}
          <div className="border-b border-gray-200 p-6 dark:border-gray-800 sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Manuscript ID
                </p>

                <p className="mt-1 text-lg font-bold text-blue-600 dark:text-blue-400">
                  {submission.manuscriptId || "—"}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-4 py-2 text-sm font-semibold ${getDecisionClass(
                  submission.editorialDecision
                )}`}
              >
                {getDecisionLabel(
                  submission.editorialDecision
                )}
              </span>
            </div>

            <h2 className="mt-6 text-2xl font-bold leading-tight">
              {submission.title || "Untitled Manuscript"}
            </h2>
          </div>

          {/* Submission Information */}
          <div className="grid gap-6 border-b border-gray-200 p-6 sm:grid-cols-2 sm:p-8 dark:border-gray-800">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Submission Date
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(submission.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Last Updated
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(submission.updatedAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Editorial Decision
              </p>

              <p className="mt-1 text-sm font-medium">
                {getDecisionLabel(
                  submission.editorialDecision
                )}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Decision Date
              </p>

              <p className="mt-1 text-sm font-medium">
                {formatDate(submission.decisionAt)}
              </p>
            </div>
          </div>

          {/* Authors */}
          <div className="border-b border-gray-200 p-6 sm:p-8 dark:border-gray-800">
            <h3 className="text-lg font-semibold">
              Authors
            </h3>

            <p className="mt-3 text-sm leading-7 text-gray-700 dark:text-gray-300">
              {formatAuthors(submission.authors)}
            </p>
          </div>

          {/* Abstract */}
          <div className="border-b border-gray-200 p-6 sm:p-8 dark:border-gray-800">
            <h3 className="text-lg font-semibold">
              Abstract
            </h3>

            <div className="mt-3 whitespace-pre-line text-sm leading-7 text-gray-700 dark:text-gray-300">
              {submission.abstract || "No abstract available."}
            </div>
          </div>

          {/* Keywords */}
          <div className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold">
              Keywords
            </h3>

            {keywords.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {keywords.map((keyword, index) => (
                  <span
                    key={`${keyword}-${index}`}
                    className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No keywords available.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/author")}
            className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Author Dashboard
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/author/submission/saved")
            }
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Back to Saved Submissions
          </button>
        </div>
      </div>
    </div>
  );
}