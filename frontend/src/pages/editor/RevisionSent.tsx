import { Link, useLocation } from "react-router-dom";

type RevisionSentState = {
  paperId: string;
  manuscriptId: string;
  title: string;
  revisionType: "MAJOR_REVISION" | "MINOR_REVISION";
  reviewReport: string;
  commentsToAuthor: string;
  sentAt: string;
};

const formatRevisionType = (
  type: RevisionSentState["revisionType"]
) => {
  return type === "MAJOR_REVISION"
    ? "Major Revision"
    : "Minor Revision";
};

export default function RevisionSent() {
  const location = useLocation();

  const state =
    location.state as RevisionSentState | null;

  if (!state) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 dark:border-red-900 dark:bg-red-950/40">
            <h1 className="text-xl font-bold text-red-700 dark:text-red-300">
              Revision information not available
            </h1>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              The revision details could not be loaded.
            </p>

            <Link
              to="/editor/papers"
              className="mt-6 inline-block rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
            >
              ← Back to My Papers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const revisionLabel = formatRevisionType(
    state.revisionType
  );

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Editorial Decision
          </p>

          <h1 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            Revision Sent Successfully
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            The revised decision and reviewer report have been sent to the author.
          </p>
        </div>

        {/* Success Message */}
        <div className="mb-8 rounded-xl border border-green-200 bg-green-50 px-6 py-5 dark:border-green-900 dark:bg-green-950/40">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              ✓
            </div>

            <div>
              <h2 className="text-lg font-semibold text-green-800 dark:text-green-300">
                {revisionLabel} sent to author successfully.
              </h2>

              <p className="mt-1 text-sm text-green-700 dark:text-green-400">
                The manuscript status has been updated and the author has been notified.
              </p>
            </div>
          </div>
        </div>

        {/* Manuscript Information */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <h2 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">
            Manuscript Information
          </h2>

          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Manuscript ID
              </p>

              <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
                {state.manuscriptId}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Revision Type
              </p>

              <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
                {revisionLabel}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Manuscript Title
              </p>

              <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 font-medium text-gray-900 dark:bg-gray-800 dark:text-white">
                {state.title || "Not available"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Current Status
              </p>

              <div className="mt-2">
                <span className="inline-flex rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                  {revisionLabel}
                </span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Sent On
              </p>

              <p className="mt-2 rounded-lg bg-gray-50 px-4 py-3 text-gray-900 dark:bg-gray-800 dark:text-white">
                {new Date(state.sentAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Reviewer Report */}
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Reviewer Report Sent to Author
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            This is the edited reviewer report that was sent with the revision request.
          </p>

          <div className="mt-5 whitespace-pre-wrap rounded-xl bg-gray-50 p-6 leading-7 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {state.reviewReport}
          </div>
        </div>

        {/* Comments to Author */}
        {state.commentsToAuthor.trim() && (
          <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Comments to Author
            </h2>

            <div className="mt-5 whitespace-pre-wrap rounded-xl bg-gray-50 p-6 leading-7 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
              {state.commentsToAuthor}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">

          <Link
            to={`/editor/papers/${location.state?.paperId || ""}`}
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            ← Back to Paper Details
          </Link>

          <Link
            to="/editor/papers"
            className="rounded-lg bg-indigo-600 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Back to My Papers
          </Link>
        </div>

      </div>
    </div>
  );
}