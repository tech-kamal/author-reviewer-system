import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  clearAuth,
  getStoredUser,
} from "../auth/auth.storage";

import ThemeToggle from "../components/ThemeToggle";

import {
  getWithdrawalRequests,
  decideWithdrawalRequest,
  getRevisionTracking,
  type RevisionTrackingItem,
  sendRevisionReminder
} from "../api/editor.api";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type Notification,
} from "../notification/notification.api";

type WithdrawalRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

type WithdrawalRequest = {
  id: string;
  paperId: string;
  authorId: string;
  reason: string;
  status: WithdrawalRequestStatus;
  editorComment?: string | null;
  decidedById?: string | null;
  requestedAt: string;
  decidedAt?: string | null;

  paper: {
    id: string;
    manuscriptId: string | null;
    title: string;
    authors: string | null;
    editorialDecision: string | null;
    decisionAt: string | null;
    withdrawnAt: string | null;
  };

  author: {
    id: string;
    name: string;
    email: string;
    affiliation?: string | null;
    orcid?: string | null;
  };

  decidedBy?: {
    id: string;
    name: string;
    email: string;
  } | null;
};

function EditorDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [withdrawalRequests, setWithdrawalRequests] = useState<
    WithdrawalRequest[]
  >([]);

  const [withdrawalLoading, setWithdrawalLoading] =
    useState(false);

  const [withdrawalError, setWithdrawalError] =
    useState("");

  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);

  const [withdrawalComment, setWithdrawalComment] =
    useState("");

  const [withdrawalSubmitting, setWithdrawalSubmitting] =
    useState(false);

  const [notifications, setNotifications] = useState<
  Notification[]
  >([]);

  const [revisionRequests, setRevisionRequests] = useState<
  RevisionTrackingItem[]
>([]);

const [revisionLoading, setRevisionLoading] = useState(false);
const [revisionError, setRevisionError] = useState("");

const [revisionReminderMessage, setRevisionReminderMessage] =
  useState("");

const [sendingReminderId, setSendingReminderId] =
  useState<string | null>(null);

const [notificationOpen, setNotificationOpen] =
  useState(false);

const [notificationLoading, setNotificationLoading] =
  useState(false);

  const handleLogout = () => {
    clearAuth();

    navigate("/login", {
      replace: true,
    });
  };


  const loadNotifications = async () => {
  try {
    setNotificationLoading(true);

    const result = await getMyNotifications();

    setNotifications(result.notifications || []);
  } catch (error) {
    console.error(
      "Failed to load notifications:",
      error
    );
  } finally {
    setNotificationLoading(false);
  }
};


  const loadWithdrawalRequests = async () => {
    try {
      setWithdrawalLoading(true);
      setWithdrawalError("");

      const result = await getWithdrawalRequests();

      setWithdrawalRequests(
        (result.withdrawalRequests || []).filter(
          (request: WithdrawalRequest) =>
            request.status === "PENDING"
        )
      );
    } catch (error: any) {
      console.error(
        "Failed to load withdrawal requests:",
        error
      );

      setWithdrawalError(
        error?.message ||
          "Failed to load withdrawal requests."
      );
    } finally {
      setWithdrawalLoading(false);
    }
  };

  const loadRevisionTracking = async () => {
  try {
    setRevisionLoading(true);
    setRevisionError("");

    const result = await getRevisionTracking();

    setRevisionRequests(result.revisionRequests || []);
  } catch (error: any) {
    console.error("Failed to load revision tracking:", error);

    setRevisionError(
      error?.message || "Failed to load revision tracking."
    );
  } finally {
    setRevisionLoading(false);
  }
  };

  useEffect(() => {
      loadWithdrawalRequests();
      loadNotifications();
      loadRevisionTracking();
  }, []);

  const unreadCount = notifications.filter(
  (notification) => !notification.isRead
  ).length;

  const pendingWithdrawalCount =
    withdrawalRequests.filter(
      (request) => request.status === "PENDING"
    ).length;

  const handleWithdrawalDecision = async (
    decision: "APPROVED" | "REJECTED"
  ) => {
    if (!selectedWithdrawal) {
      return;
    }

    const comment = withdrawalComment.trim();

    if (!comment) {
      alert("Editor comment is required.");
      return;
    }

    if (comment.length < 10) {
      alert(
        "Editor comment must be at least 10 characters."
      );
      return;
    }

    const confirmationMessage =
      decision === "APPROVED"
        ? "Are you sure you want to approve this withdrawal request?"
        : "Are you sure you want to reject this withdrawal request?";

    const confirmed = window.confirm(
      confirmationMessage
    );

    if (!confirmed) {
      return;
    }

    try {
      setWithdrawalSubmitting(true);

      await decideWithdrawalRequest(
        selectedWithdrawal.id,
        decision,
        comment
      );

      setSelectedWithdrawal(null);
      setWithdrawalComment("");

      await loadWithdrawalRequests();

      alert(
        decision === "APPROVED"
          ? "Withdrawal request approved successfully."
          : "Withdrawal request rejected successfully."
      );
    } catch (error: any) {
      console.error(
        "Withdrawal decision error:",
        error
      );

      alert(
        error?.message ||
          "Failed to process withdrawal request."
      );
    } finally {
      setWithdrawalSubmitting(false);
    }
  };

  const closeWithdrawalModal = () => {
    if (withdrawalSubmitting) {
      return;
    }

    setSelectedWithdrawal(null);
    setWithdrawalComment("");
  };


  const handleNotificationClick = async (
  notification: Notification
) => {
  try {
    if (!notification.isRead) {
      await markNotificationAsRead(
        notification.id
      );

      setNotifications((current) =>
        current.map((item) =>
          item.id === notification.id
            ? {
                ...item,
                isRead: true,
                readAt: new Date().toISOString(),
              }
            : item
        )
      );
    }

    if (
      notification.relatedType ===
        "WITHDRAWAL_REQUEST" &&
      notification.relatedId
    ) {
      setNotificationOpen(false);

      requestAnimationFrame(() => {
        document
          .getElementById("withdrawal-requests")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      });
    }
  } catch (error) {
    console.error(
      "Failed to mark notification as read:",
      error
    );
  }
};

const handleMarkAllAsRead = async () => {
  try {
    await markAllNotificationsAsRead();

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
        readAt:
          notification.readAt ||
          new Date().toISOString(),
      }))
    );
  } catch (error) {
    console.error(
      "Failed to mark all notifications as read:",
      error
    );
  }
};


  const getStatusClasses = (
    status: WithdrawalRequestStatus
  ) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

      case "APPROVED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";

      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };




const handleSendRevisionReminder = async (
  revisionRequestId: string
) => {
  try {
    setSendingReminderId(revisionRequestId);
    setRevisionReminderMessage("");

    const result = await sendRevisionReminder(revisionRequestId);

    setRevisionReminderMessage(
      result.message || "Revision reminder email sent successfully."
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to send revision reminder.";

    setRevisionReminderMessage(message);
  } finally {
    setSendingReminderId(null);
  }
};





  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">



      {revisionReminderMessage && (
        <div
          role="status"
          className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300"
        >
          {revisionReminderMessage}
          <button
            type="button"
            onClick={() => setRevisionReminderMessage("")}
            className="ml-3 font-bold"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              TSP Reviewer System
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Editor Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationOpen(
                    (current) => !current
                  )
                }
                className="relative rounded-lg p-2.5 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label="Notifications"
              >
                <span className="text-xl">
                  🔔
                </span>

                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                    {unreadCount > 99
                      ? "99+"
                      : unreadCount}
                  </span>
                )}
              </button>

              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[360px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
                  
                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Notifications
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {unreadCount} unread
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  {/* Notifications */}
                  <div className="max-h-[420px] overflow-y-auto">
                    {notificationLoading ? (
                      <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                        Loading notifications...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-4 py-10 text-center">
                        <div className="text-3xl">
                          🔔
                        </div>

                        <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                          No notifications
                        </p>

                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          You're all caught up.
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              handleNotificationClick(
                                notification
                              )
                            }
                            className={`block w-full border-b border-gray-100 px-4 py-4 text-left transition last:border-b-0 dark:border-gray-800 ${
                              notification.isRead
                                ? "bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800"
                                : "bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/30 dark:hover:bg-blue-950/50"
                            }`}
                          >
                            <div className="flex gap-3">
                              <div className="mt-0.5 shrink-0">
                                {notification.isRead
                                  ? "📩"
                                  : "🔔"}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <p
                                    className={`text-sm ${
                                      notification.isRead
                                        ? "font-medium"
                                        : "font-bold"
                                    } text-gray-900 dark:text-white`}
                                  >
                                    {notification.title}
                                  </p>

                                  {!notification.isRead && (
                                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                                  )}
                                </div>

                                <p className="mt-1 text-sm leading-5 text-gray-600 dark:text-gray-400">
                                  {notification.message}
                                </p>

                                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString("en-IN")}
                                </p>
                              </div>
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Theme */}
            <ThemeToggle />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome, {user?.name}
          </h2>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You are logged in as an Editor.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {/* My Papers Button */}
            <Link
              to="/editor/papers"
              className="inline-flex items-center rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              My Papers
            </Link>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={loadWithdrawalRequests}
              disabled={withdrawalLoading}
              className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {withdrawalLoading
                ? "Refreshing..."
                : "Refresh Requests"}
            </button>
          </div>
        </div>


        
        {/* Revision Tracking */}
        <section
          id="revision-tracking"
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Revision Tracking
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Track revision requests sent to authors and their current status.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {revisionRequests.length} Active
              </span>

              <button
                type="button"
                onClick={loadRevisionTracking}
                disabled={revisionLoading}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                {revisionLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          </div>

          {revisionLoading ? (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Loading revision requests...
            </div>
          ) : revisionError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/20">
              <p className="text-sm text-red-700 dark:text-red-300">
                {revisionError}
              </p>
              <button
                type="button"
                onClick={loadRevisionTracking}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : revisionRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <p className="font-semibold text-gray-900 dark:text-white">
                No Active Revision Requests
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Revision requests will appear here after they are sent to authors.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisionRequests.map((request) => {
                const isMajor = request.revisionType === "MAJOR_REVISION";

                const statusClasses =
                  request.status === "RECEIVED"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";

                const statusLabel =
                  request.status === "RECEIVED"
                    ? "Received by Author"
                    : "Sent to Author";

                return (
                  <article
                    key={request.id}
                    className="rounded-xl border border-gray-200 p-5 dark:border-gray-700"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.paper.title || "Untitled Manuscript"}
                        </h3>

                        <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">
                          Manuscript ID: {request.paper.manuscriptId || "—"}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isMajor
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                          }`}
                        >
                          {isMajor ? "Major Revision" : "Minor Revision"}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                        >
                          {statusLabel}
                        </span>

                         {request.status === "SENT" && (
                            <button
                              type="button"
                              onClick={() => handleSendRevisionReminder(request.id)}
                              disabled={sendingReminderId === request.id}
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {sendingReminderId === request.id
                                ? "Sending..."
                                : "Send Reminder"}
                            </button>
                          )}
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Author
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                          {request.author.name || "—"}
                        </p>
                        <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-400">
                          {request.author.email || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Revision Sent
                        </p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {request.sentAt
                            ? new Date(request.sentAt).toLocaleString("en-IN")
                            : "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Author Received
                        </p>
                        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                          {request.receivedAt
                            ? new Date(request.receivedAt).toLocaleString("en-IN")
                            : "Not yet recorded"}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>


        {/* Withdrawal Requests */}
       <section
          id="withdrawal-requests"
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8"
        >
          {/* Section Header */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Withdrawal Requests
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review manuscript withdrawal requests
                submitted by authors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1.5 text-sm font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                {pendingWithdrawalCount} Pending
              </span>
            </div>
          </div>

          {/* Loading */}
          {withdrawalLoading ? (
            <div className="rounded-xl border border-gray-200 py-12 text-center dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading withdrawal requests...
              </p>
            </div>
          ) : withdrawalError ? (
            /* Error */
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-900/20">
              <p className="text-sm font-medium text-red-700 dark:text-red-300">
                {withdrawalError}
              </p>

              <button
                type="button"
                onClick={loadWithdrawalRequests}
                className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            /* Empty State */
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-700">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <svg
                  className="h-6 w-6 text-gray-500 dark:text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h4m5-9v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6l4 4Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14 5v4h4"
                  />
                </svg>
              </div>

              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                No Withdrawal Requests
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                There are currently no manuscript
                withdrawal requests.
              </p>
            </div>
          ) : (
            /* Request List */
            <div className="space-y-4">
              {withdrawalRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-xl border border-gray-200 p-5 transition hover:shadow-sm dark:border-gray-700"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Request Information */}
                    <div className="min-w-0 flex-1">
                      {/* Title + Status */}
                      <div className="flex flex-wrap items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {request.paper?.title ||
                              "Untitled Manuscript"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Manuscript ID:{" "}
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {request.paper
                                ?.manuscriptId || "—"}
                            </span>
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </div>

                      {/* Metadata */}
                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Author
                          </p>

                          <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">
                            {request.author?.name ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Email
                          </p>

                          <p className="mt-1 break-all text-sm text-gray-700 dark:text-gray-300">
                            {request.author?.email ||
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Requested
                          </p>

                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {request.requestedAt
                              ? new Date(
                                  request.requestedAt
                                ).toLocaleString()
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Editorial Decision
                          </p>

                          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                            {request.paper
                              ?.editorialDecision ||
                              "Under Editorial Review"}
                          </p>
                        </div>
                      </div>

                      {/* Author Reason */}
                      <div className="mt-5 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Author's Withdrawal Reason
                        </p>

                        <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                          {request.reason}
                        </p>
                      </div>

                      {/* Editor Comment */}
                      {request.editorComment && (
                        <div className="mt-3 rounded-xl bg-gray-50 p-4 dark:bg-gray-800">
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Editor Comment
                          </p>

                          <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                            {request.editorComment}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action */}
                    {request.status === "PENDING" && (
                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWithdrawal(
                              request
                            );
                            setWithdrawalComment("");
                          }}
                          className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 lg:w-auto"
                        >
                          Review Request
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Withdrawal Review Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl dark:bg-gray-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Review Withdrawal Request
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Review the author's request and
                  provide your comments before making a
                  decision.
                </p>
              </div>

              <button
                type="button"
                onClick={closeWithdrawalModal}
                disabled={withdrawalSubmitting}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-6 px-6 py-6">
              {/* Manuscript */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Manuscript
                </p>

                <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white">
                  {selectedWithdrawal.paper?.title ||
                    "Untitled Manuscript"}
                </p>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Manuscript ID:{" "}
                  {selectedWithdrawal.paper
                    ?.manuscriptId || "—"}
                </p>
              </div>

              {/* Author */}
              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Author
                </p>

                <p className="mt-1 font-medium text-gray-900 dark:text-white">
                  {selectedWithdrawal.author?.name ||
                    "—"}
                </p>

                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedWithdrawal.author?.email ||
                    "—"}
                </p>

                {selectedWithdrawal.author
                  ?.affiliation && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {selectedWithdrawal.author.affiliation}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="rounded-xl bg-gray-50 p-5 dark:bg-gray-800">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Author's Withdrawal Reason
                </p>

                <p className="text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {selectedWithdrawal.reason}
                </p>
              </div>

              {/* Editor Comment */}
              <div>
                <label
                  htmlFor="withdrawal-editor-comment"
                  className="mb-2 block text-sm font-semibold text-gray-900 dark:text-white"
                >
                  Editor Comment{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  id="withdrawal-editor-comment"
                  value={withdrawalComment}
                  onChange={(event) =>
                    setWithdrawalComment(
                      event.target.value
                    )
                  }
                  rows={5}
                  maxLength={2000}
                  disabled={withdrawalSubmitting}
                  placeholder="Enter your comments regarding this withdrawal request..."
                  className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:disabled:bg-gray-800"
                />

                <div className="mt-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    Minimum 10 characters required.
                  </span>

                  <span>
                    {withdrawalComment.length}/2000
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end dark:border-gray-800">
                <button
                  type="button"
                  disabled={withdrawalSubmitting}
                  onClick={closeWithdrawalModal}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={withdrawalSubmitting}
                  onClick={() =>
                    handleWithdrawalDecision(
                      "REJECTED"
                    )
                  }
                  className="rounded-lg border border-red-300 px-5 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20"
                >
                  {withdrawalSubmitting
                    ? "Processing..."
                    : "Reject"}
                </button>

                <button
                  type="button"
                  disabled={withdrawalSubmitting}
                  onClick={() =>
                    handleWithdrawalDecision(
                      "APPROVED"
                    )
                  }
                  className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {withdrawalSubmitting
                    ? "Processing..."
                    : "Approve Withdrawal"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditorDashboard;