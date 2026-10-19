import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { clearAuth, getToken } from "./auth.storage";

// const IDLE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
const IDLE_TIMEOUT = 30 * 60 * 1000; // 2 minutes
const LAST_ACTIVITY_KEY = "journal_reviewer_last_activity";

// Prevent excessive localStorage writes on mouse movement
const ACTIVITY_THROTTLE = 30 * 1000; // 30 seconds

function IdleSessionManager() {
  const navigate = useNavigate();
  const location = useLocation();

  const lastSavedActivityRef = useRef<number>(0);
  const logoutInProgressRef = useRef(false);

  useEffect(() => {
    const logoutForInactivity = () => {
      if (logoutInProgressRef.current) {
        return;
      }

      logoutInProgressRef.current = true;

      clearAuth();
      localStorage.removeItem(LAST_ACTIVITY_KEY);

      navigate("/login", {
        replace: true,
        state: {
          sessionExpired: true,
        },
      });
    };

    const checkSession = () => {
      const token = getToken();

      // User is not logged in
      if (!token) {
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        return;
      }

      const now = Date.now();
      const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

      // First authenticated visit
      if (!storedActivity) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        lastSavedActivityRef.current = now;
        return;
      }

      const lastActivity = Number(storedActivity);

      // Invalid timestamp protection
      if (!Number.isFinite(lastActivity)) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        lastSavedActivityRef.current = now;
        return;
      }

      const inactiveTime = now - lastActivity;

      if (inactiveTime >= IDLE_TIMEOUT) {
        logoutForInactivity();
      }
    };

    const handleActivity = () => {
      const token = getToken();

      if (!token) {
        return;
      }

      const now = Date.now();

      // First check whether the existing session has already expired
      const storedActivity = localStorage.getItem(LAST_ACTIVITY_KEY);

      if (storedActivity) {
        const lastActivity = Number(storedActivity);

        if (
          Number.isFinite(lastActivity) &&
          now - lastActivity >= IDLE_TIMEOUT
        ) {
          logoutForInactivity();
          return;
        }
      }

      // Throttle localStorage updates
      if (
        now - lastSavedActivityRef.current >= ACTIVITY_THROTTLE ||
        !storedActivity
      ) {
        localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
        lastSavedActivityRef.current = now;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSession();
      }
    };

    const handleWindowFocus = () => {
      checkSession();
    };

    const handleStorageChange = (event: StorageEvent) => {
      // Another tab logged the user out
      if (event.key === null || event.key === LAST_ACTIVITY_KEY) {
        const token = getToken();

        if (!token) {
          localStorage.removeItem(LAST_ACTIVITY_KEY);

          if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
          }
        }
      }
    };

    // Initial check
    checkSession();

    // User activity events
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
      "pointerdown",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity);
    });

    // Check when tab becomes visible/focused again
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener("focus", handleWindowFocus);

    // Sync authentication state between browser tabs
    window.addEventListener("storage", handleStorageChange);

    // Periodic safety check
    const intervalId = window.setInterval(() => {
      checkSession();
    }, 30 * 1000);

    return () => {
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener("focus", handleWindowFocus);
      window.removeEventListener("storage", handleStorageChange);

      window.clearInterval(intervalId);
    };
  }, [navigate, location.pathname]);

  return null;
}

export default IdleSessionManager;