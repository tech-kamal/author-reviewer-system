import { api } from "../api/api";

export interface EditorInvitationResponse {
  success: boolean;
  invitation: {
    email: string;
    expiresAt: string;
  };
}

export interface RegisterEditorResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "EDITOR";
    createdAt: string;
  };
}

// ============================================
// Validate Editor Invitation
// ============================================

export const validateEditorInvitation = async (
  token: string
): Promise<EditorInvitationResponse> => {
  const response = await api.get(
    `/admin/editor-invitations/${token}`
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Invalid editor invitation"
    );
  }

  return result;
};

// ============================================
// Register Editor
// ============================================

export const registerEditor = async (
  token: string,
  data: {
    name: string;
    password: string;
  }
): Promise<RegisterEditorResponse> => {
  const response = await api.post(
    `/admin/editor-invitations/${token}/register`,
    data
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Editor registration failed"
    );
  }

  return result;
};