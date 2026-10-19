import { api } from "../api/api";

export interface AdminStats {
  administrators: number;
  editors: number;
  reviewers: number;
  pendingInvitations: number;
}

export interface AdminStatsResponse {
  success: boolean;
  stats: AdminStats;
}

export const getAdminStats =
  async (): Promise<AdminStatsResponse> => {
    const response = await api.get(
      "/admin/stats"
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to load admin statistics"
      );
    }

    return result;
  };


  // ============================================
// Admin Types
// ============================================

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "ADMIN";
  createdAt: string;
}

export interface AdminListResponse {
  success: boolean;
  admins: Admin[];
}

// ============================================
// Get All Admins
// GET /api/admin/admins
// ============================================

export const getAdmins =
  async (): Promise<AdminListResponse> => {
    const response = await api.get(
      "/admin/admins"
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to load administrators"
      );
    }

    return result;
  };

// ============================================
// Delete Admin
// DELETE /api/admin/admins/:id
// ============================================

export const deleteAdmin =
  async (id: string) => {
    const response = await api.delete(
      `/admin/admins/${id}`
    );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to delete administrator"
      );
    }

    return result;
  };


  // ============================================
// Create Admin
// POST /api/admin/admins
// ============================================

export const createAdmin = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post(
    "/admin/admins",
    data
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to create administrator"
    );
  }

  return result;
};


// ============================================
// Editor Invitations
// ============================================

export interface EditorInvitation {
  id: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface EditorInvitationListResponse {
  success: boolean;
  invitations: EditorInvitation[];
}

export interface CreateEditorInvitationResponse {
  success: boolean;
  message: string;
 invitation: {
  id: string;
  email: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
};
}

// ============================================
// Get Editor Invitations
// ============================================

export const getEditorInvitations =
  async (): Promise<EditorInvitationListResponse> => {
    const response = await api.get(
      "/admin/editor-invitations"
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to load editor invitations"
      );
    }

    return result;
  };

// ============================================
// Create Editor Invitation
// ============================================

export const createEditorInvitation =
  async (
    email: string
  ): Promise<CreateEditorInvitationResponse> => {
    const response = await api.post(
      "/admin/editor-invitations",
      {
        email,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to send editor invitation"
      );
    }

    return result;
  };



// ============================================
// Managed Users
// ============================================

export interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: "EDITOR" | "REVIEWER";
  createdAt: string;
}

export interface ManagedUsersResponse {
  success: boolean;
  users: ManagedUser[];
}

// ============================================
// Get Editors / Reviewers
// ============================================

export const getUsersByRole = async (
  role: "EDITOR" | "REVIEWER"
): Promise<ManagedUsersResponse> => {
  const response = await api.get(
    `/admin/users?role=${role}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        `Failed to load ${role.toLowerCase()}s`
    );
  }

  return result;
};

// ============================================
// Delete Editor / Reviewer
// ============================================

export const deleteUser = async (
  id: string
) => {
  const response = await api.delete(
    `/admin/users/${id}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message ||
        "Failed to delete user"
    );
  }

  return result;
};

// ============================================
// Delete Editor Invitation
// ============================================

export const deleteEditorInvitation =
  async (id: string) => {
    const response = await api.delete(
      `/admin/editor-invitations/${id}`
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message ||
          "Failed to delete invitation"
      );
    }

    return result;
  };