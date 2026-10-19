import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminStats } from "../../admin/admin.api";

import {
  clearAuth,
  getStoredUser,
} from "../../auth/auth.storage";

import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  getEditorInvitations,
  createEditorInvitation,
  getUsersByRole,
  deleteUser,
  deleteEditorInvitation,
  type Admin,
  type EditorInvitation,
  type ManagedUser,
} from "../../admin/admin.api";


import ThemeToggle from "../../components/ThemeToggle";

function AdminDashboard() {
  const navigate = useNavigate();
  const user = getStoredUser();

  const [stats, setStats] = useState({
  administrators: 0,
  editors: 0,
  reviewers: 0,
  pendingInvitations: 0,
});

const [loadingStats, setLoadingStats] = useState(true);
const [statsError, setStatsError] = useState("");
const [admins, setAdmins] = useState<Admin[]>([]);
const [loadingAdmins, setLoadingAdmins] = useState(true);
const [adminsError, setAdminsError] = useState("");
const [deletingAdminId, setDeletingAdminId] =
  useState<string | null>(null);

const [showCreateAdmin, setShowCreateAdmin] =
  useState(false);

const [adminName, setAdminName] = useState("");
const [adminEmail, setAdminEmail] = useState("");
const [adminPassword, setAdminPassword] =
  useState("");

const [creatingAdmin, setCreatingAdmin] =
  useState(false);

const [createAdminError, setCreateAdminError] =
  useState("");



// ============================================
// Editor Invitation State
// ============================================

const [showInviteEditor, setShowInviteEditor] =
  useState(false);

const [editorEmail, setEditorEmail] =
  useState("");

const [creatingInvitation, setCreatingInvitation] =
  useState(false);

const [invitationError, setInvitationError] =
  useState("");

const [invitationSuccess, setInvitationSuccess] =
  useState("");

const [invitations, setInvitations] =
  useState<EditorInvitation[]>([]);

const [loadingInvitations, setLoadingInvitations] =
  useState(true);

const [invitationsError, setInvitationsError] =
  useState("");




// ============================================
// Statistics Detail View
// ============================================

type DetailType =
  | "EDITOR"
  | "REVIEWER"
  | "PENDING"
  | null;

const [detailType, setDetailType] =
  useState<DetailType>(null);

const [detailUsers, setDetailUsers] =
  useState<ManagedUser[]>([]);

const [detailInvitations, setDetailInvitations] =
  useState<EditorInvitation[]>([]);

const [loadingDetails, setLoadingDetails] =
  useState(false);

const [detailsError, setDetailsError] =
  useState("");

const [deletingDetailId, setDeletingDetailId] =
  useState<string | null>(null);




  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };


  useEffect(() => {
  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setStatsError("");

      const result = await getAdminStats();

      setStats(result.stats);
    } catch (error) {
      setStatsError(
        error instanceof Error
          ? error.message
          : "Failed to load dashboard statistics"
      );
    } finally {
      setLoadingStats(false);
    }
  };

  loadStats();
}, []);


useEffect(() => {
  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      setAdminsError("");

      const result = await getAdmins();

      setAdmins(result.admins);
    } catch (error) {
      setAdminsError(
        error instanceof Error
          ? error.message
          : "Failed to load administrators"
      );
    } finally {
      setLoadingAdmins(false);
    }
  };

  loadAdmins();
}, []);




// ============================================
// Load Editor Invitations
// ============================================

useEffect(() => {
  const loadInvitations = async () => {
    try {
      setLoadingInvitations(true);
      setInvitationsError("");

      const result =
        await getEditorInvitations();

      setInvitations(result.invitations);
    } catch (error) {
      setInvitationsError(
        error instanceof Error
          ? error.message
          : "Failed to load editor invitations"
      );
    } finally {
      setLoadingInvitations(false);
    }
  };

  loadInvitations();
}, []);





const handleDeleteAdmin = async (
  admin: Admin
) => {
  if (admin.id === user?.id) {
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete ${admin.name}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingAdminId(admin.id);
    setAdminsError("");

    await deleteAdmin(admin.id);

    setAdmins((currentAdmins) =>
      currentAdmins.filter(
        (item) => item.id !== admin.id
      )
    );

    setStats((currentStats) => ({
      ...currentStats,
      administrators:
        currentStats.administrators - 1,
    }));
  } catch (error) {
    setAdminsError(
      error instanceof Error
        ? error.message
        : "Failed to delete administrator"
    );
  } finally {
    setDeletingAdminId(null);
  }
};


const handleCreateAdmin = async (
  event: React.FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  try {
    setCreatingAdmin(true);
    setCreateAdminError("");

    const result = await createAdmin({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
    });

    setAdmins((currentAdmins) => [
      ...currentAdmins,
      result.admin,
    ]);

    setAdminName("");
    setAdminEmail("");
    setAdminPassword("");

    setShowCreateAdmin(false);

    setStats((currentStats) => ({
      ...currentStats,
      administrators:
        currentStats.administrators + 1,
    }));
  } catch (error) {
    setCreateAdminError(
      error instanceof Error
        ? error.message
        : "Failed to create administrator"
    );
  } finally {
    setCreatingAdmin(false);
  }
};


// ============================================
// Create Editor Invitation
// ============================================

const handleCreateEditorInvitation =
  async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setCreatingInvitation(true);
      setInvitationError("");
      setInvitationSuccess("");

      const normalizedEmail =
        editorEmail.trim().toLowerCase();

      const result =
        await createEditorInvitation(
          normalizedEmail
        );

      // Add newly created invitation
      // to the beginning of the list.
      setInvitations((currentInvitations) => [
        result.invitation,
        ...currentInvitations,
      ]);

      // Update pending invitation count.
      setStats((currentStats) => ({
        ...currentStats,
        pendingInvitations:
          currentStats.pendingInvitations + 1,
      }));

      setEditorEmail("");

      setInvitationSuccess(
        "Editor invitation sent successfully."
      );

      setShowInviteEditor(false);
    } catch (error) {
      setInvitationError(
        error instanceof Error
          ? error.message
          : "Failed to send editor invitation"
      );
    } finally {
      setCreatingInvitation(false);
    }
  };




// ============================================
// Open Statistics Details
// ============================================

const handleOpenDetails = async (
  type: "EDITOR" | "REVIEWER" | "PENDING"
) => {
  setDetailType(type);
  setDetailsError("");

  // Pending invitations already loaded
  // from the invitation list.
  if (type === "PENDING") {
    setDetailInvitations(
      invitations.filter((invitation) => {
        return (
          !invitation.usedAt &&
          new Date(
            invitation.expiresAt
          ) > new Date()
        );
      })
    );

    setDetailUsers([]);
    return;
  }

  try {
    setLoadingDetails(true);

    const result =
      await getUsersByRole(type);

    setDetailUsers(result.users);
    setDetailInvitations([]);
  } catch (error) {
    setDetailsError(
      error instanceof Error
        ? error.message
        : "Failed to load details"
    );
  } finally {
    setLoadingDetails(false);
  }
};



// ============================================
// Delete Statistics Detail Item
// ============================================

const handleDeleteDetail = async (
  id: string,
  type: "EDITOR" | "REVIEWER" | "PENDING"
) => {
  const confirmed = window.confirm(
    type === "PENDING"
      ? "Are you sure you want to delete this invitation?"
      : `Are you sure you want to delete this ${type.toLowerCase()}?`
  );

  if (!confirmed) {
    return;
  }

  try {
    setDeletingDetailId(id);
    setDetailsError("");

    if (type === "PENDING") {
      await deleteEditorInvitation(id);

      setDetailInvitations(
        (current) =>
          current.filter(
            (item) => item.id !== id
          )
      );

      setInvitations(
        (current) =>
          current.filter(
            (item) => item.id !== id
          )
      );

      setStats((current) => ({
        ...current,
        pendingInvitations:
          Math.max(
            0,
            current.pendingInvitations - 1
          ),
      }));
    } else {
      await deleteUser(id);

      setDetailUsers(
        (current) =>
          current.filter(
            (item) => item.id !== id
          )
      );

      setStats((current) => ({
        ...current,
        [type === "EDITOR"
          ? "editors"
          : "reviewers"]:
          Math.max(
            0,
            current[
              type === "EDITOR"
                ? "editors"
                : "reviewers"
            ] - 1
          ),
      }));
    }
  } catch (error) {
    setDetailsError(
      error instanceof Error
        ? error.message
        : "Failed to delete"
    );
  } finally {
    setDeletingDetailId(null);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-white">
      {/* ============================================
          Header
      ============================================ */}

      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div>
            <h1 className="text-xl font-bold">
              Journal Reviewer System
            </h1>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Logout
            </button>
          </div>

        </div>
      </header>

      {/* ============================================
          Main Content
      ============================================ */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Welcome */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Welcome, {user?.name || "Administrator"}
          </h2>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage administrators, editors, and system invitations.
          </p>
        </div>

        {/* ============================================
            Statistics
        ============================================ */}

            {statsError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {statsError}
            </div>
            )}


        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Administrators
            </p>

            <p className="mt-2 text-3xl font-bold">
            {loadingStats ? "..." : stats.administrators}
            </p>
          </div>

         <button
            type="button"
            onClick={() => handleOpenDetails("EDITOR")}
            className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Editors
            </p>

            <p className="mt-2 text-3xl font-bold">
            {loadingStats ? "..." : stats.editors}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenDetails("REVIEWER")}
            className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Reviewers
            </p>

           <p className="mt-2 text-3xl font-bold">
            {loadingStats ? "..." : stats.reviewers}
            </p>
          </button>

          <button
            type="button"
            onClick={() => handleOpenDetails("PENDING")}
            className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white p-6 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Pending Invitations
            </p>

            <p className="mt-2 text-3xl font-bold">
            {loadingStats ? "..." : stats.pendingInvitations}
            </p>
          </button>

        </div>

        {/* ============================================
            Admin Management
        ============================================ */}

        <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

          <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">

            <div>
              <h3 className="text-lg font-bold">
                Admin Management
              </h3>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create and manage system administrators.
              </p>
            </div>

            <button
                type="button"
                onClick={() => {
                    setShowCreateAdmin(true);
                    setCreateAdminError("");
                }}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                + Create Admin
            </button>

          </div>

         <div className="p-6">


            {showCreateAdmin && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950">
                <div className="mb-5">
                <h4 className="text-lg font-bold">
                    Create New Administrator
                </h4>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Create another administrator account.
                </p>
                </div>

                {createAdminError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                    {createAdminError}
                </div>
                )}

                <form
                onSubmit={handleCreateAdmin}
                className="grid gap-5 md:grid-cols-3"
                >
                <div>
                    <label className="mb-2 block text-sm font-medium">
                    Name
                    </label>

                    <input
                    type="text"
                    value={adminName}
                    onChange={(event) =>
                        setAdminName(event.target.value)
                    }
                    placeholder="Administrator name"
                    required
                    minLength={2}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                    Email
                    </label>

                    <input
                    type="email"
                    value={adminEmail}
                    onChange={(event) =>
                        setAdminEmail(event.target.value)
                    }
                    placeholder="admin@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                    Password
                    </label>

                    <input
                    type="password"
                    value={adminPassword}
                    onChange={(event) =>
                        setAdminPassword(event.target.value)
                    }
                    placeholder="Minimum 6 characters"
                    required
                    minLength={6}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
                    />
                </div>

                <div className="flex gap-3 md:col-span-3">
                    <button
                    type="submit"
                    disabled={creatingAdmin}
                    className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                    {creatingAdmin
                        ? "Creating..."
                        : "Create Admin"}
                    </button>

                    <button
                    type="button"
                    disabled={creatingAdmin}
                    onClick={() => {
                        setShowCreateAdmin(false);
                        setCreateAdminError("");
                    }}
                    className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                    >
                    Cancel
                    </button>
                </div>
                </form>
            </div>
            )}



            {adminsError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                {adminsError}
                </div>
            )}

            {loadingAdmins ? (
                <div className="rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading administrators...
                </p>
                </div>
            ) : admins.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p className="font-medium text-gray-700 dark:text-gray-300">
                    No administrators found.
                </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                    <thead>
                    <tr className="border-b border-gray-200 text-left dark:border-gray-800">
                        <th className="px-4 py-3 text-sm font-semibold">
                        Name
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                        Email
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                        Role
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                        Created
                        </th>

                        <th className="px-4 py-3 text-right text-sm font-semibold">
                        Action
                        </th>
                    </tr>
                    </thead>

                    <tbody>
                    {admins.map((admin) => {
                        const isCurrentUser =
                        admin.id === user?.id;

                        const isDeleting =
                        deletingAdminId === admin.id;

                        return (
                        <tr
                            key={admin.id}
                            className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                        >
                            <td className="px-4 py-4">
                            <div className="font-medium">
                                {admin.name}
                            </div>

                            {isCurrentUser && (
                                <span className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400">
                                You
                                </span>
                            )}
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {admin.email}
                            </td>

                            <td className="px-4 py-4">
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/50 dark:text-blue-400">
                                {admin.role}
                            </span>
                            </td>

                            <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(
                                admin.createdAt
                            ).toLocaleDateString()}
                            </td>

                            <td className="px-4 py-4 text-right">
                            <button
                                type="button"
                                disabled={
                                isCurrentUser ||
                                isDeleting
                                }
                                onClick={() =>
                                handleDeleteAdmin(admin)
                                }
                                className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                                {isDeleting
                                ? "Deleting..."
                                : isCurrentUser
                                    ? "Current Admin"
                                    : "Delete"}
                            </button>
                            </td>
                        </tr>
                        );
                    })}
                    </tbody>
                </table>
                </div>
            )}

            </div>

        </section>

        {/* ============================================
            Editor Invitations
        ============================================ */}

     {/* ============================================
          Editor Invitations
      ============================================ */}

      <section className="mt-8 rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">

        {/* Section Header */}
        <div className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">

          <div>
            <h3 className="text-lg font-bold">
              Editor Invitations
            </h3>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Invite trusted users to register as editors.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowInviteEditor(true);
              setInvitationError("");
              setInvitationSuccess("");
            }}
            className="rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
          >
            Invite Editor
          </button>

        </div>

        <div className="p-6">

          {/* Success Message */}
          {invitationSuccess && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-400">
              {invitationSuccess}
            </div>
          )}

          {/* Error Message */}
          {invitationsError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {invitationsError}
            </div>
          )}

          {invitationError && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
              {invitationError}
            </div>
          )}

          {/* Invite Editor Form */}
          {showInviteEditor && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-6 dark:border-gray-800 dark:bg-gray-950">

              <div className="mb-5">
                <h4 className="text-lg font-bold">
                  Invite New Editor
                </h4>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  An invitation email will be sent to this
                  address. The invitation will expire after
                  7 days.
                </p>
              </div>

              <form
                onSubmit={handleCreateEditorInvitation}
                className="flex flex-col gap-4 sm:flex-row sm:items-end"
              >

                <div className="flex-1">
                  <label
                    htmlFor="editorEmail"
                    className="mb-2 block text-sm font-medium"
                  >
                    Editor Email
                  </label>

                  <input
                    id="editorEmail"
                    type="email"
                    value={editorEmail}
                    onChange={(event) =>
                      setEditorEmail(
                        event.target.value
                      )
                    }
                    placeholder="editor@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creatingInvitation}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingInvitation
                    ? "Sending..."
                    : "Send Invitation"}
                </button>

                <button
                  type="button"
                  disabled={creatingInvitation}
                  onClick={() => {
                    setShowInviteEditor(false);
                    setEditorEmail("");
                    setInvitationError("");
                  }}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

              </form>

            </div>
          )}

          {/* Invitation List */}
          {loadingInvitations ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading editor invitations...
              </p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
              <p className="font-medium text-gray-700 dark:text-gray-300">
                No editor invitations yet.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Sent invitations will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">

                <thead>
                  <tr className="border-b border-gray-200 text-left dark:border-gray-800">

                    <th className="px-4 py-3 text-sm font-semibold">
                      Email
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold">
                      Status
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold">
                      Sent
                    </th>

                    <th className="px-4 py-3 text-sm font-semibold">
                      Expires
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {invitations.map((invitation) => {

                    const isUsed =
                      Boolean(invitation.usedAt);

                    const isExpired =
                      !isUsed &&
                      new Date(
                        invitation.expiresAt
                      ) <= new Date();

                    let status = "Pending";

                    if (isUsed) {
                      status = "Used";
                    } else if (isExpired) {
                      status = "Expired";
                    }

                    return (
                      <tr
                        key={invitation.id}
                        className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                      >

                        <td className="px-4 py-4 text-sm font-medium">
                          {invitation.email}
                        </td>

                        <td className="px-4 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              status === "Used"
                                ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                                : status === "Expired"
                                ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400"
                            }`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(
                            invitation.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(
                            invitation.expiresAt
                          ).toLocaleDateString()}
                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>
            </div>
          )}

        </div>

      </section>

      {/* ============================================
          Statistics Details Modal
      ============================================ */}

      {detailType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

          <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-900">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">

              <div>
                <h3 className="text-xl font-bold">
                  {detailType === "EDITOR"
                    ? "Editors"
                    : detailType === "REVIEWER"
                    ? "Reviewers"
                    : "Pending Invitations"}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {detailType === "EDITOR"
                    ? "Manage registered editors."
                    : detailType === "REVIEWER"
                    ? "Manage registered reviewers."
                    : "Manage pending editor invitations."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDetailType(null);
                  setDetailsError("");
                }}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Close
              </button>

            </div>

            {/* Content */}
            <div className="max-h-[65vh] overflow-y-auto p-6">

              {detailsError && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400">
                  {detailsError}
                </div>
              )}

              {loadingDetails ? (
                <div className="rounded-xl border border-gray-200 p-8 text-center dark:border-gray-800">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading...
                  </p>
                </div>
              ) : detailType === "PENDING" ? (

                detailInvitations.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      No pending invitations.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">

                      <thead>
                        <tr className="border-b border-gray-200 text-left dark:border-gray-800">
                          <th className="px-4 py-3 text-sm font-semibold">
                            Email
                          </th>

                          <th className="px-4 py-3 text-sm font-semibold">
                            Sent
                          </th>

                          <th className="px-4 py-3 text-sm font-semibold">
                            Expires
                          </th>

                          <th className="px-4 py-3 text-right text-sm font-semibold">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {detailInvitations.map(
                          (invitation) => (
                            <tr
                              key={invitation.id}
                              className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                            >
                              <td className="px-4 py-4 text-sm font-medium">
                                {invitation.email}
                              </td>

                              <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  invitation.createdAt
                                ).toLocaleDateString()}
                              </td>

                              <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {new Date(
                                  invitation.expiresAt
                                ).toLocaleDateString()}
                              </td>

                              <td className="px-4 py-4 text-right">
                                <button
                                  type="button"
                                  disabled={
                                    deletingDetailId ===
                                    invitation.id
                                  }
                                  onClick={() =>
                                    handleDeleteDetail(
                                      invitation.id,
                                      "PENDING"
                                    )
                                  }
                                  className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                  {deletingDetailId ===
                                  invitation.id
                                    ? "Deleting..."
                                    : "Delete"}
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>

                    </table>
                  </div>
                )

              ) : detailUsers.length === 0 ? (

                <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    No{" "}
                    {detailType === "EDITOR"
                      ? "editors"
                      : "reviewers"}{" "}
                    found.
                  </p>
                </div>

              ) : (

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px]">

                    <thead>
                      <tr className="border-b border-gray-200 text-left dark:border-gray-800">
                        <th className="px-4 py-3 text-sm font-semibold">
                          Name
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                          Email
                        </th>

                        <th className="px-4 py-3 text-sm font-semibold">
                          Created
                        </th>

                        <th className="px-4 py-3 text-right text-sm font-semibold">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {detailUsers.map((managedUser) => (
                        <tr
                          key={managedUser.id}
                          className="border-b border-gray-100 last:border-0 dark:border-gray-800"
                        >

                          <td className="px-4 py-4 font-medium">
                            {managedUser.name}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {managedUser.email}
                          </td>

                          <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {new Date(
                              managedUser.createdAt
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              disabled={
                                deletingDetailId ===
                                managedUser.id
                              }
                              onClick={() =>
                                handleDeleteDetail(
                                  managedUser.id,
                                  detailType
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              {deletingDetailId ===
                              managedUser.id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      </main>
    </div>
  );
}

export default AdminDashboard;