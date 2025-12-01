import React, { useEffect } from "react";

export const GoogleCallbackPage: React.FC = () => {
  useEffect(() => {
    // 1) Read tokens from query string
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (accessToken) {
      localStorage.setItem("authToken", accessToken);
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    const target =
      sessionStorage.getItem("postLoginRedirect") || "/";

    sessionStorage.removeItem("postLoginRedirect");

    window.location.replace(target);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen text-gray-700">
      Finishing Google sign-in…
    </div>
  );
};