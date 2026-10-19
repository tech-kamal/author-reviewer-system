import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { FaCamera, FaLock, FaUserCircle } from "react-icons/fa";
import {
  changePassword,
  getProfile,
  updateProfile,
  updateProfilePhoto,
} from "../profile/profile.api";
import type { UserProfile } from "../profile/profile.api";

const API_BASE_URL = "http://localhost:4000";

const getPhotoUrl = (photo: string | null) => {
  if (!photo) return "";
  if (photo.startsWith("http")) return photo;
  return `${API_BASE_URL}${photo}`;
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [orcid, setOrcid] = useState("");
  const [country, setCountry] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPhoto, setSavingPhoto] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await getProfile();
        const data = response.profile;

        setProfile(data);

        setName(data.name || "");
        setEmail(data.email || "");
        setAffiliation(data.affiliation || "");
        setOrcid(data.orcid || "");
        setCountry(data.country || "");

        if (data.profilePhoto) {
          setPhotoPreview(getPhotoUrl(data.profilePhoto));
        }
      } catch (error) {
        setProfileError(
          error instanceof Error
            ? error.message
            : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleProfileSubmit = async (event: FormEvent) => {
    event.preventDefault();

    setProfileMessage("");
    setProfileError("");

    if (!name.trim()) {
      setProfileError("Name is required.");
      return;
    }

    try {
      setSavingProfile(true);

      const response = await updateProfile({
        name: name.trim(),
        affiliation: affiliation.trim(),
        orcid: orcid.trim(),
        country: country.trim(),
      });

      setProfile(response.profile);
      setName(response.profile.name);
      setEmail(response.profile.email);
      setAffiliation(response.profile.affiliation || "");
      setOrcid(response.profile.orcid || "");
      setCountry(response.profile.country || "");

      setProfileMessage(
        response.message || "Profile updated successfully."
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile"
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePhotoChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setProfileMessage("");
    setProfileError("");

    if (file.size > 5 * 1024 * 1024) {
      setProfileError("Profile photo must be 5 MB or smaller.");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setProfileError(
        "Only JPG, PNG and WebP images are allowed."
      );

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPhotoPreview(localPreview);

    try {
      setSavingPhoto(true);

      const response = await updateProfilePhoto(file);

      setProfile(response.profile);

      if (response.profile.profilePhoto) {
        setPhotoPreview(
          getPhotoUrl(response.profile.profilePhoto)
        );
      }

      setProfileMessage(
        response.message || "Profile photo updated successfully."
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Failed to update profile photo"
      );

      if (profile?.profilePhoto) {
        setPhotoPreview(getPhotoUrl(profile.profilePhoto));
      } else {
        setPhotoPreview("");
      }
    } finally {
      setSavingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent
  ) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError(
        "New password must be at least 6 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New password and confirmation password do not match."
      );
      return;
    }

    try {
      setChangingPassword(true);

      const response = await changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordMessage(
        response.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Failed to change password"
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10 transition-colors duration-300 dark:bg-gray-950 sm:px-6">
        <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400">
              Loading profile...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 transition-colors duration-300 dark:bg-gray-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Account Settings
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            My Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Manage your personal and academic information,
            profile photo, and account password.
          </p>
        </div>

        {/* Profile Header Card */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900">
          <div className="h-28 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                {/* Profile Photo */}
                <div className="relative">
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-md dark:border-gray-900 dark:bg-gray-800">
                    {photoPreview ? (
                      <img
                        src={photoPreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="h-20 w-20 text-gray-400 dark:text-gray-600" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={savingPhoto}
                    className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-900"
                    title="Change profile photo"
                  >
                    <FaCamera className="text-sm" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>

                <div className="pb-[24px]">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {profile?.name}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {profile?.email}
                  </p>
                </div>
              </div>

              <div className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300">
                {profile?.role}
              </div>
            </div>
          </div>
        </section>

        {/* Profile Messages */}
        {(profileMessage || profileError) && (
          <div
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              profileError
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
            }`}
          >
            {profileError || profileMessage}
          </div>
        )}

        {/* Personal & Academic Information */}
        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Personal & Academic Information
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Keep your profile information up to date.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Name */}
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>

                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>

                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  readOnly
                  className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-600 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
                />

                <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                  Email address cannot be changed here.
                </p>
              </div>

              {/* Affiliation */}
              <div className="md:col-span-2">
                <label
                  htmlFor="profile-affiliation"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Affiliation
                </label>

                <input
                  id="profile-affiliation"
                  type="text"
                  value={affiliation}
                  onChange={(event) =>
                    setAffiliation(event.target.value)
                  }
                  placeholder="e.g. Department of Mathematics, ABC University"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* ORCID */}
              <div>
                <label
                  htmlFor="profile-orcid"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  ORCID
                </label>

                <input
                  id="profile-orcid"
                  type="text"
                  value={orcid}
                  onChange={(event) =>
                    setOrcid(event.target.value)
                  }
                  placeholder="e.g. 0000-0002-1825-0097"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="profile-country"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Country
                </label>

                <input
                  id="profile-country"
                  type="text"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value)
                  }
                  placeholder="e.g. India"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </section>

        {/* Password Section */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-colors duration-300 dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <FaLock />
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Update your account password securely.
              </p>
            </div>
          </div>

          {(passwordMessage || passwordError) && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                passwordError
                  ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                  : "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
              }`}
            >
              {passwordError || passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Current Password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Current Password
                </label>

                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(event) =>
                    setCurrentPassword(event.target.value)
                  }
                  placeholder="Current password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* New Password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-900/40"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={changingPassword}
                className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              >
                {changingPassword
                  ? "Updating..."
                  : "Change Password"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
};

export default Profile;