import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getStoredUser } from "../../auth/auth.storage";

type InvitationAction = "accept" | "decline";

function ReviewInvitation() {
  const invitationProcessed = useRef(false);
  const { token, action } = useParams<{
    token: string;
    action: InvitationAction;
  }>();

  const user = getStoredUser();


  const formatAuthors = (
  authors?: string | null
) => {
  if (!authors) {
    return [];
  }

  try {
    const parsedAuthors = JSON.parse(authors);

    if (!Array.isArray(parsedAuthors)) {
      return [];
    }

    return parsedAuthors
      .map((author) => {
        if (
          typeof author !== "object" ||
          author === null ||
          !("name" in author) ||
          typeof author.name !== "string"
        ) {
          return null;
        }

        return {
          name: author.name,

          role:
            "role" in author &&
            typeof author.role === "string"
              ? author.role
              : "",

          affiliation:
            "affiliation" in author &&
            typeof author.affiliation === "string"
              ? author.affiliation
              : "",
        };
      })
      .filter(
        (
          author
        ): author is {
          name: string;
          role: string;
          affiliation: string;
        } => author !== null
      );
  } catch {
    return [];
  }
};


  const [status, setStatus] = useState<
    "loading" | "success" | "error"
  >("loading");

  const [message, setMessage] = useState(
    "Processing invitation..."
  );

  const [paperInfo, setPaperInfo] = useState<{
    manuscriptId?: string | null;
    authors?: string | null;
    title?: string | null;
  }>({});
  // const hasProcessed = useRef(false);

 useEffect(() => {
  // Prevent duplicate API request
  if (invitationProcessed.current) {
    return;
  }

  invitationProcessed.current = true;

  const processInvitation = async () => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid invitation token.");
      return;
    }

    if (
      action !== "accept" &&
      action !== "decline"
    ) {
      setStatus("error");
      setMessage("Invalid invitation action.");
      return;
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/reviewer/invitations/${token}/${action}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to process invitation."
        );
      }

      setStatus("success");


      setPaperInfo({
        manuscriptId: data.reviewRequest?.paper?.manuscriptId,
        authors: data.reviewRequest?.paper?.authors,
        title: data.reviewRequest?.paper?.title,
      });

      setMessage(
        data.message ||
          `Review invitation ${
            action === "accept"
              ? "accepted"
              : "declined"
          } successfully.`
      );
    } catch (error) {
      setStatus("error");

      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to process invitation."
      );
    }
  };

  processInvitation();
}, [token, action]);

  const isAccepted = action === "accept";

  const formattedAuthors = formatAuthors(
    paperInfo.authors
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 py-10 dark:bg-gray-950">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 dark:border-gray-700 dark:border-t-blue-400" />

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Processing Invitation
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Please wait while we process your
              review invitation.
            </p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-2xl ${
                isAccepted
                  ? "bg-green-100 text-green-600 dark:bg-green-950/40 dark:text-green-400"
                  : "bg-yellow-100 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400"
              }`}
            >
              {isAccepted ? "✓" : "!"}
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
              {isAccepted
                ? "Invitation Accepted"
                : "Invitation Declined"}
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {message}
            </p>

            {(paperInfo.manuscriptId || paperInfo.title) && (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-5 text-left dark:border-gray-700 dark:bg-gray-800">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Manuscript Information
                </h2>

                {paperInfo.manuscriptId && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Manuscript ID
                    </p>

                    <p className="mt-1 text-sm font-bold text-blue-600 dark:text-blue-400">
                      {paperInfo.manuscriptId}
                    </p>
                  </div>
                )}


              {formattedAuthors.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Author(s)
                  </p>

                  <div className="mt-2 space-y-3">
                    {formattedAuthors.map(
                      (author, index) => (
                        <div
                          key={`${author.name}-${index}`}
                          className={
                            index > 0
                              ? "border-t border-gray-200 pt-3 dark:border-gray-700"
                              : ""
                          }
                        >
                          <p className="text-sm font-bold text-gray-900 dark:text-white">
                            {index + 1}. {author.name}
                          </p>

                          {author.role && (
                            <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                              {author.role}
                            </p>
                          )}

                          {author.affiliation && (
                            <p className="mt-1 text-xs leading-5 text-gray-500 dark:text-gray-400">
                              {author.affiliation}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}


                {paperInfo.title && (
                  <div className="mt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      Paper Title
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {paperInfo.title}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6">
              {user?.role === "REVIEWER" ? (
                <Link
                  to="/reviewer"
                  className="inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Reviewer Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                >
                  Reviewer Login
                </Link>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-2xl text-red-600 dark:bg-red-950/40 dark:text-red-400">
              !
            </div>

            <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">
              Invitation Failed
            </h1>

            <p className="mt-3 text-gray-600 dark:text-gray-400">
              {message}
            </p>

            <div className="mt-6">
              <Link
                to="/login"
                className="inline-flex rounded-lg bg-gray-900 px-5 py-3 font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                Go to Login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ReviewInvitation;