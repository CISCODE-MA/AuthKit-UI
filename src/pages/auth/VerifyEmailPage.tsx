import React from "react";
import { useT } from "@ciscode/ui-translate-core";
import { useAuthConfig } from "../../context/AuthConfigContext";
import { toTailwindColorClasses } from "../../utils/colorHelpers";
import { useSearchParams, useNavigate } from "react-router-dom";

export const VerifyEmailPage: React.FC = () => {
  const t = useT("authLib");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") || "";

  const {
    brandName = t("brandName", { defaultValue: "MyBrand" }),
    colors = { bg: "bg-sky-500", text: "text-white", border: "border-sky-500" },
    logoUrl,
    illustrationUrl = t("community.illustrationUrl", {
      defaultValue:
        "https://cdn.builder.io/api/v1/image/assets/TEMP/35ba84b8335fda2819c3a14ea3d00321a0fd0e79e571caa31108468010868ca5?placeholderIfAbsent=true&apiKey=a460e9a46e514356ac1106eada03046c",
    }),
    communityContent = {
      title: t("community.title"),
      description: t("community.description"),
    },
  } = useAuthConfig();

  const { bgClass, textClass, borderClass } = toTailwindColorClasses(colors);
  const gradientClass = `${bgClass} bg-gradient-to-r from-white/10 via-white/0 to-white/0`;

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 ${gradientClass}`}>
      <div className="flex w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Illustration Panel */}
        <div className={`hidden md:flex md:w-1/2 p-12 flex-col justify-between text-white ${bgClass}`}>
          <div>
            {logoUrl ? (
              <div className="flex items-center gap-4">
                <img
                  loading="lazy"
                  src={logoUrl}
                  alt="Brand Logo"
                  className="bg-white h-8 md:h-22 rounded-lg"
                />
                <h2 className="text-sm md:text-2xl font-bold uppercase">{brandName}</h2>
              </div>
            ) : (
              <h2 className="text-sm md:text-2xl font-bold">{brandName}</h2>
            )}
          </div>
          <div className="flex-1 space-y-4 mt-6 py-4">
            <h3 className="text-2xl font-semibold leading-tight">{communityContent.title}</h3>
            <p className="text-base leading-relaxed opacity-90 ltr:text-left rtl:text-right">
              {communityContent.description}
            </p>
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/20 rounded-full blur-xl" />
              <img
                loading="lazy"
                src={illustrationUrl}
                alt="Verify email illustration"
                className="max-w-sm w-full mx-auto rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300 p-6"
              />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 p-4 md:p-8 m-auto">
          {/* Logo for small screens */}
          <div className="flex items-center justify-center md:hidden mb-5">
            {logoUrl ? (
              <img
                loading="lazy"
                src={logoUrl}
                alt="Brand Logo"
                className={`h-22 rounded-full border ${borderClass}`}
              />
            ) : (
              <h2 className="text-2xl font-bold">{brandName}</h2>
            )}
          </div>

          {/* Success banner */}
          <div className="mb-6">
            <div className="flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.036-3.286a.75.75 0 10-1.072-1.048l-4.58 4.687-2.101-2.102a.75.75 0 10-1.06 1.06l2.63 2.631a.75.75 0 001.079-.012l5.104-5.216z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="font-semibold">
                  {t("VerifyEmailPage.sentTitle", { defaultValue: "Verification email sent" })}
                </p>
                <p className="text-sm">
                  {t("VerifyEmailPage.sentDesc", {
                    defaultValue: `We sent a verification link to ${email}. Please check your inbox and spam/junk folder.`,
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Guidance + actions */}
          <div className="space-y-4">
            <p className="text-gray-700 text-sm">
              {t("VerifyEmailPage.helpText", {
                defaultValue:
                  "Open the email and click the verification link to activate your account.",
              })}
            </p>

            {/* Optional resend – pending backend endpoint; keep disabled for now */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-600 cursor-not-allowed"
                title={t("VerifyEmailPage.resendDisabledTip", { defaultValue: "Resend endpoint not configured" })}
              >
                {t("VerifyEmailPage.resendCta", { defaultValue: "Resend verification email" })}
              </button>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={`px-4 py-2 rounded-md ${bgClass} text-white`}
              >
                {t("VerifyEmailPage.backToLogin", { defaultValue: "Back to sign in" })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
