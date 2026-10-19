import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaUserCircle,
  FaUserEdit,
  FaUserCheck,
  FaUserCog,
  FaSignOutAlt,
  FaChevronDown,
} from "react-icons/fa";

import {
  clearAuth,
  getStoredUser,
} from "../auth/auth.storage";

import ThemeToggle from "./ThemeToggle";
import { getProfile } from "../profile/profile.api";


function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [profileMenuOpen, setProfileMenuOpen] =
    useState(false);

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const [profileName, setProfileName] =
    useState("");

  const [profileEmail, setProfileEmail] =
    useState("");

  const profileMenuRef =
    useRef<HTMLDivElement | null>(null);

  const mobileProfileMenuRef =
    useRef<HTMLDivElement | null>(null);


  // =====================================================
  // Load logged-in user
  // =====================================================

  const user = getStoredUser();

  const isReviewer =
    user?.role === "REVIEWER";


  // =====================================================
  // Check login status + Load Profile
  // =====================================================

  useEffect(() => {
    const storedUser = getStoredUser();

    setIsLoggedIn(!!storedUser);

    if (!storedUser) {
      setProfilePhoto(null);
      setProfileName("");
      setProfileEmail("");
      return;
    }

    // Initial values from stored user
    setProfileName(storedUser.name);
    setProfileEmail(storedUser.email);

    // Get latest profile data
    const loadProfile = async () => {
      try {
        const response = await getProfile();

        setProfileName(
          response.profile.name
        );

        setProfileEmail(
          response.profile.email
        );

        setProfilePhoto(
          response.profile.profilePhoto
        );
      } catch (error) {
        console.error(
          "Failed to load profile:",
          error
        );
      }
    };

    loadProfile();
  }, [location.pathname]);


  // =====================================================
  // Close profile dropdown when clicking outside
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target =
        event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(
          target
        )
      ) {
        setProfileMenuOpen(false);
      }

      if (
        mobileProfileMenuRef.current &&
        !mobileProfileMenuRef.current.contains(
          target
        )
      ) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  // =====================================================
  // Profile Photo URL
  // =====================================================

  const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace(
      /\/api\/?$/,
      ""
    ) || "http://localhost:4000";


  const getProfilePhotoUrl = (
    photo: string | null
  ) => {
    if (!photo) {
      return null;
    }

    if (photo.startsWith("http")) {
      return photo;
    }

    return `${API_BASE_URL}${
      photo.startsWith("/")
        ? ""
        : "/"
    }${photo}`;
  };


  // =====================================================
  // Logout
  // =====================================================

  const handleLogout = () => {
    clearAuth();

    setIsLoggedIn(false);
    setProfilePhoto(null);
    setProfileName("");
    setProfileEmail("");

    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    navigate("/login", {
      replace: true,
    });
  };


  // =====================================================
  // Close mobile menu
  // =====================================================

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };


  // =====================================================
  // Profile navigation
  // =====================================================

  const handleProfileNavigation = (
    path: string
  ) => {
    setProfileMenuOpen(false);
    setMobileMenuOpen(false);

    navigate(path);
  };


  // =====================================================
  // Active navigation
  // =====================================================

  const isActive = (
    path: string
  ) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname === path;
  };


  // =====================================================
  // Workspace detection
  // =====================================================

  const isReviewerWorkspace =
    location.pathname.startsWith(
      "/reviewer"
    );

  const isAuthorWorkspace =
    location.pathname.startsWith(
      "/author"
    );


  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-md transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950/95">

      {/* =====================================================
          MAIN NAVBAR
          ===================================================== */}

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">


        {/* =================================================
            LOGO
            ================================================= */}

        <Link
          to="/"
          onClick={() => {
            closeMobileMenu();
            setProfileMenuOpen(false);
          }}
          className="shrink-0 text-lg font-bold tracking-tight text-gray-900 transition-colors duration-200 hover:text-blue-600 dark:text-white dark:hover:text-blue-400 sm:text-xl"
        >
          <img
            src="/logo.png"
            className="h-[48px] w-[120px]"
            alt="Journal Reviewer"
          />
        </Link>


        {/* =================================================
            DESKTOP NAVIGATION
            ================================================= */}

        <nav className="hidden items-center gap-8 md:flex">


          {/* =========================
              HOME
              ========================= */}

          <Link
            to="/"
            className={`group relative py-5 text-sm font-medium transition-colors duration-200 ${
              isActive("/")
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            }`}
          >
            Home

            <span
              className={`absolute bottom-0 left-0 right-0 h-0.5 origin-center rounded-full bg-blue-600 transition-transform duration-300 ease-out dark:bg-blue-400 ${
                isActive("/")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>


          {/* =========================
              SERVICES
              ========================= */}

          <Link
            to="/services"
            className={`group relative py-5 text-sm font-medium transition-colors duration-200 ${
              isActive("/services")
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            }`}
          >
            Services

            <span
              className={`absolute bottom-0 left-0 right-0 h-0.5 origin-center rounded-full bg-blue-600 transition-transform duration-300 ease-out dark:bg-blue-400 ${
                isActive("/services")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>


          {/* =========================
              INFORMATION
              ========================= */}

          <Link
            to="/information"
            className={`group relative py-5 text-sm font-medium transition-colors duration-200 ${
              isActive("/information")
                ? "text-blue-600 dark:text-blue-400"
                : "text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            }`}
          >
            Information

            <span
              className={`absolute bottom-0 left-0 right-0 h-0.5 origin-center rounded-full bg-blue-600 transition-transform duration-300 ease-out dark:bg-blue-400 ${
                isActive("/information")
                  ? "scale-x-100"
                  : "scale-x-0 group-hover:scale-x-100"
              }`}
            />
          </Link>

        </nav>


        {/* =================================================
            DESKTOP RIGHT CONTROLS
            ================================================= */}

        <div className="hidden items-center gap-3 md:flex">


          {/* Theme Toggle */}

          <ThemeToggle />


          {/* =================================================
              LOGGED-IN USER PROFILE
              ================================================= */}

          {isLoggedIn && user ? (

            <div
              ref={profileMenuRef}
              className="relative"
            >


              {/* Profile Button */}

              <button
                type="button"
                onClick={() =>
                  setProfileMenuOpen(
                    (current) =>
                      !current
                  )
                }
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-left transition-all duration-200 hover:border-blue-200 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800"
                aria-label="Open profile menu"
                aria-expanded={
                  profileMenuOpen
                }
              >

                {/* Profile Photo */}

                {profilePhoto ? (

                  <img
                    src={
                      getProfilePhotoUrl(
                        profilePhoto
                      ) || ""
                    }
                    alt={
                      profileName ||
                      "Profile"
                    }
                    className="h-9 w-9 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                  />

                ) : (

                  <FaUserCircle className="h-9 w-9 text-gray-400" />

                )}


                {/* Name + Email */}

                <div className="hidden min-w-0 lg:block">

                  <p className="max-w-[130px] truncate text-xs font-semibold text-gray-900 dark:text-white">
                    {profileName ||
                      user.name}
                  </p>

                  <p className="max-w-[130px] truncate text-[11px] text-gray-500 dark:text-gray-400">
                    {profileEmail ||
                      user.email}
                  </p>

                </div>


                {/* Arrow */}

                <FaChevronDown
                  className={`ml-1 h-3 w-3 text-gray-400 transition-transform duration-200 ${
                    profileMenuOpen
                      ? "rotate-180"
                      : ""
                  }`}
                />

              </button>


              {/* =================================================
                  DESKTOP PROFILE DROPDOWN
                  ================================================= */}

              {profileMenuOpen && (

                <div className="absolute right-0 top-full mt-3 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5 dark:border-gray-700 dark:bg-gray-900 dark:ring-white/5">


                  {/* User Header */}

                  <div className="border-b border-gray-100 px-4 py-4 dark:border-gray-800">

                    <div className="flex items-center gap-3">

                      {/* Photo */}

                      {profilePhoto ? (

                        <img
                          src={
                            getProfilePhotoUrl(
                              profilePhoto
                            ) || ""
                          }
                          alt={
                            profileName ||
                            "Profile"
                          }
                          className="h-12 w-12 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                        />

                      ) : (

                        <FaUserCircle className="h-12 w-12 text-gray-400" />

                      )}


                      <div className="min-w-0">

                        <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                          {profileName ||
                            user.name}
                        </p>

                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {profileEmail ||
                            user.email}
                        </p>

                      </div>

                    </div>

                  </div>


                  {/* =================================================
                      WORKSPACE SECTION
                      Reviewer account can use both workspaces
                      ================================================= */}

                  {isReviewer && (

                    <div className="border-b border-gray-100 p-2 dark:border-gray-800">

                      <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Workspace
                      </p>


                      {/* Author */}

                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigation(
                            "/author"
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isAuthorWorkspace
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        }`}
                      >

                        <FaUserEdit className="h-4 w-4" />

                        <span className="flex-1 text-left">
                          Author
                        </span>

                        {isAuthorWorkspace && (

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />

                        )}

                      </button>


                      {/* Reviewer */}

                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigation(
                            "/reviewer"
                          )
                        }
                        className={`mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          isReviewerWorkspace
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                        }`}
                      >

                        <FaUserCheck className="h-4 w-4" />

                        <span className="flex-1 text-left">
                          Reviewer
                        </span>

                        {isReviewerWorkspace && (

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />

                        )}

                      </button>

                    </div>

                  )}


                  {/* =================================================
                      PROFILE
                      ================================================= */}

                  <div className="p-2">

                    <button
                      type="button"
                      onClick={() =>
                        handleProfileNavigation(
                          "/profile"
                        )
                      }
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                        isActive("/profile")
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                          : "text-gray-700 hover:bg-gray-100 hover:text-blue-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                      }`}
                    >

                      <FaUserCog className="h-4 w-4" />

                      <span>
                        Profile
                      </span>

                    </button>


                    {/* Logout */}

                    <button
                      type="button"
                      onClick={
                        handleLogout
                      }
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >

                      <FaSignOutAlt className="h-4 w-4" />

                      <span>
                        Logout
                      </span>

                    </button>

                  </div>

                </div>

              )}

            </div>

          ) : (

            /* =================================================
               LOGIN
               ================================================= */

            <Link
              to="/login"
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                location.pathname ===
                "/login"
                  ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
              }`}
            >
              Login
            </Link>

          )}

        </div>


        {/* =================================================
            MOBILE MENU BUTTON
            ================================================= */}

        <button
          type="button"
          onClick={() =>
            setMobileMenuOpen(
              (current) =>
                !current
            )
          }
          className="rounded-lg p-2 text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={
            mobileMenuOpen
          }
        >
          {mobileMenuOpen
            ? "✕"
            : "☰"}
        </button>

      </div>


      {/* =====================================================
          MOBILE MENU
          ===================================================== */}

      {mobileMenuOpen && (

        <div className="border-t border-gray-200 bg-white transition-colors duration-300 dark:border-gray-800 dark:bg-gray-950 md:hidden">

          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6">


            {/* =========================
                HOME
                ========================= */}

            <Link
              to="/"
              onClick={
                closeMobileMenu
              }
              className={`group relative rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive("/")
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >

              <span className="flex items-center justify-between">

                Home

                <span
                  className={`h-0.5 rounded-full bg-blue-600 transition-all duration-300 ease-out dark:bg-blue-400 ${
                    isActive("/")
                      ? "w-8 opacity-100"
                      : "w-0 opacity-0 group-hover:w-8 group-hover:opacity-100"
                  }`}
                />

              </span>

            </Link>


            {/* =========================
                SERVICES
                ========================= */}

            <Link
              to="/services"
              onClick={
                closeMobileMenu
              }
              className={`group relative mt-1 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive(
                  "/services"
                )
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >

              <span className="flex items-center justify-between">

                Services

                <span
                  className={`h-0.5 rounded-full bg-blue-600 transition-all duration-300 ease-out dark:bg-blue-400 ${
                    isActive(
                      "/services"
                    )
                      ? "w-8 opacity-100"
                      : "w-0 opacity-0 group-hover:w-8 group-hover:opacity-100"
                  }`}
                />

              </span>

            </Link>


            {/* =========================
                INFORMATION
                ========================= */}

            <Link
              to="/information"
              onClick={
                closeMobileMenu
              }
              className={`group relative mt-1 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 ${
                isActive(
                  "/information"
                )
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              }`}
            >

              <span className="flex items-center justify-between">

                Information

                <span
                  className={`h-0.5 rounded-full bg-blue-600 transition-all duration-300 ease-out dark:bg-blue-400 ${
                    isActive(
                      "/information"
                    )
                      ? "w-8 opacity-100"
                      : "w-0 opacity-0 group-hover:w-8 group-hover:opacity-100"
                  }`}
                />

              </span>

            </Link>


            {/* =================================================
                MOBILE PROFILE SECTION
                ================================================= */}

            {isLoggedIn &&
              user && (

                <div
                  ref={
                    mobileProfileMenuRef
                  }
                  className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800"
                >


                  {/* User Header */}

                  <div className="mb-2 flex items-center gap-3 rounded-xl bg-gray-50 px-3 py-3 dark:bg-gray-900">


                    {/* Mobile Profile Photo */}

                    {profilePhoto ? (

                      <img
                        src={
                          getProfilePhotoUrl(
                            profilePhoto
                          ) || ""
                        }
                        alt={
                          profileName ||
                          "Profile"
                        }
                        className="h-10 w-10 shrink-0 rounded-full border border-gray-200 object-cover dark:border-gray-700"
                      />

                    ) : (

                      <FaUserCircle className="h-10 w-10 shrink-0 text-gray-400 dark:text-gray-500" />

                    )}


                    <div className="min-w-0">

                      <p className="truncate text-sm font-bold text-gray-900 dark:text-white">
                        {profileName ||
                          user.name}
                      </p>

                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {profileEmail ||
                          user.email}
                      </p>

                    </div>

                  </div>


                  {/* =================================================
                      Workspace
                      ================================================= */}

                  {isReviewer && (

                    <>

                      <p className="px-3 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                        Workspace
                      </p>


                      {/* Author */}

                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigation(
                            "/author"
                          )
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                          isAuthorWorkspace
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >

                        <FaUserEdit className="h-4 w-4" />

                        <span className="flex-1 text-left">
                          Author
                        </span>

                        {isAuthorWorkspace && (

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />

                        )}

                      </button>


                      {/* Reviewer */}

                      <button
                        type="button"
                        onClick={() =>
                          handleProfileNavigation(
                            "/reviewer"
                          )
                        }
                        className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                          isReviewerWorkspace
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                      >

                        <FaUserCheck className="h-4 w-4" />

                        <span className="flex-1 text-left">
                          Reviewer
                        </span>

                        {isReviewerWorkspace && (

                          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />

                        )}

                      </button>

                    </>

                  )}


                  {/* =================================================
                      Profile
                      ================================================= */}

                  <button
                    type="button"
                    onClick={() =>
                      handleProfileNavigation(
                        "/profile"
                      )
                    }
                    className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors ${
                      isActive(
                        "/profile"
                      )
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >

                    <FaUserCog className="h-4 w-4" />

                    <span className="flex-1 text-left">
                      Profile
                    </span>

                  </button>


                  {/* =================================================
                      Logout
                      ================================================= */}

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                  >

                    <FaSignOutAlt className="h-4 w-4" />

                    <span>
                      Logout
                    </span>

                  </button>

                </div>

              )}


            {/* =================================================
                MOBILE BOTTOM CONTROLS
                ================================================= */}

            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">


              {/* Theme Toggle */}

              <ThemeToggle />


              {/* Login for Guest */}

              {!isLoggedIn && (

                <Link
                  to="/login"
                  onClick={
                    closeMobileMenu
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    location.pathname ===
                    "/login"
                      ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      : "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                  }`}
                >
                  Login
                </Link>

              )}

            </div>

          </nav>

        </div>

      )}

    </header>
  );
}


export default Navbar;