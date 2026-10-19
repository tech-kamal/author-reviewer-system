import { authenticatedApi } from "../api/authenticatedApi";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR" | "REVIEWER";
  affiliation: string | null;
  orcid: string | null;
  country: string | null;
  profilePhoto: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileResponse {
  success: boolean;
  profile: UserProfile;
  message?: string;
}

export interface UpdateProfileData {
  name: string;
  affiliation?: string;
  orcid?: string;
  country?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const getProfile = async (): Promise<ProfileResponse> => {
  const response = await authenticatedApi.get("/profile");

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to load profile");
  }

  return result;
};

export const updateProfile = async (
  data: UpdateProfileData
): Promise<ProfileResponse> => {
  const response = await authenticatedApi.patch("/profile", data);

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update profile");
  }

  return result;
};

export const updateProfilePhoto = async (
  file: File
): Promise<ProfileResponse> => {
  const formData = new FormData();

  formData.append("profilePhoto", file);

  const response = await authenticatedApi.patch(
    "/profile/photo",
    formData
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to update profile photo"
    );
  }

  return result;
};

export const changePassword = async (
  data: ChangePasswordData
): Promise<{ success: boolean; message: string }> => {
  const response = await authenticatedApi.patch(
    "/profile/password",
    data
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || "Failed to change password"
    );
  }

  return result;
};