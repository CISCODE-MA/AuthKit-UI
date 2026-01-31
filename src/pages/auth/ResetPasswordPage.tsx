import React, { useMemo, useState } from "react";
import { useT } from "@ciscode/ui-translate-core";
import { useLocation, useNavigate } from "react-router-dom";
import { InputField } from "../../components/actions/InputField";
import { InlineError } from "../../components/InlineError";
import { useAuthConfig } from "../../context/AuthConfigContext";
import { useAuthState } from "../../context/AuthStateContext";
import { toTailwindColorClasses } from "../../utils/colorHelpers";

export const ResetPasswordPage: React.FC = () => {
  const t = useT("authLib");
  const navigate = useNavigate();
  const location = useLocation();

  const { colors, brandName = t("brandName", { defaultValue: "MyBrand" }), logoUrl } = useAuthConfig();
  const { api } = useAuthState();

  const { bgClass, textClass, borderClass } = toTailwindColorClasses(colors);
  const gradientClass = `${bgClass} bg-gradient-to-r from-white/10 via-white/0 to-white/0`;

  const token = useMemo(() => new URLSearchParams(location.search).get("token"), [location.search]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const minLength = 6;
  const valid = token && newPassword.length >= minLength && newPassword === confirmPassword;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    setError(null);

    if (!token) {
      setError(t("ResetPasswordPage.invalidLink", { defaultValue: "Invalid reset link." }));
      return;
    }
    if (newPassword.length < minLength) {
      setError(
        t("ResetPasswordPage.tooShort", { defaultValue: `Password must be at least ${minLength} characters.` })
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t("ResetPasswordPage.mismatch", { defaultValue: "Passwords do not match." }));
      return;
    }

    setPending(true);
    try {
      await api.post("/api/auth/reset-password", { token, newPassword });
      // On success, show brief confirmation then navigate to login
      navigate("/login", { replace: true });
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 400 || status === 401 || status === 410) {
        setError(
          t("ResetPasswordPage.invalidOrExpired", {
            defaultValue: "Reset link is invalid or has expired. Request a new one.",
          })
        );
      } else {
        setError(t("errors.generic", { defaultValue: "Something went wrong. Please try again." }));
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${gradientClass}`}>
      <div className="flex w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="w-full p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            {logoUrl ? (
              <img
                loading="lazy"
                src={logoUrl}
                alt="Brand Logo"
                className={`h-10 rounded-lg border ${borderClass}`}
              />
            ) : (
              <h2 className="text-xl font-bold">{brandName}</h2>
            )}
            <button type="button" onClick={() => navigate("/login")} className={`text-sm ${textClass}`}>
              {t("ResetPasswordPage.backToLogin", { defaultValue: "Back to Sign In" })}
            </button>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t("ResetPasswordPage.title", { defaultValue: "Reset your password" })}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {t("ResetPasswordPage.subtitle", { defaultValue: "Choose a new password to access your account." })}
          </p>

          {error && <InlineError message={error} />}

          {!token && (
            <div className="mt-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 text-sm">
              {t("ResetPasswordPage.invalidLink", { defaultValue: "Invalid reset link." })}
            </div>
          )}

          <form className="space-y-6 mt-4" onSubmit={handleSubmit}>
            <InputField
              label={t("form.passwordLabel")}
              type="password"
              placeholder={t("form.passwordPlaceholder")}
              color={borderClass}
              value={newPassword}
              onChange={setNewPassword}
            />
            <InputField
              label={t("ResetPasswordPage.confirmLabel", { defaultValue: "Confirm Password" })}
              type="password"
              placeholder={t("ResetPasswordPage.confirmPlaceholder", { defaultValue: "Re-enter your password" })}
              color={borderClass}
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            <button
              type="submit"
              disabled={pending || !valid}
              className={`relative flex w-full items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors ${
                pending ? "opacity-60 cursor-not-allowed" : ""
              } ${bgClass} text-white`}
            >
              {pending && (
                <svg className="h-4 w-4 animate-spin stroke-current" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" />
                  <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeWidth="4" strokeLinecap="round" />
                </svg>
              )}
              {t("ResetPasswordPage.submit", { defaultValue: "Reset Password" })}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
