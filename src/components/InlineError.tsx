// src/components/actions/InlineError.tsx
import React, { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useT } from "@ciscode/ui-translate-core";

interface Props {
  message: string | null;   // null ⇒ hidden
  dismissAfterMs?: number;  // auto-hide (0 = stay)
}

export const InlineError: React.FC<Props> = ({
  message,
  dismissAfterMs = 4000,
}) => {
  const t = useT("authLib"); // or whichever namespace you use for common strings
  // Track which message was dismissed — avoids setState-in-effect and ref-during-render issues
  const [dismissedForMessage, setDismissedForMessage] = useState<string | null>(null);

  /* auto-hide after delay */
  useEffect(() => {
    if (!message || dismissAfterMs <= 0) return;
    const id = window.setTimeout(() => setDismissedForMessage(message), dismissAfterMs);
    return () => window.clearTimeout(id);
  }, [message, dismissAfterMs]);

  const show = Boolean(message) && message !== dismissedForMessage;

  if (!show) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        relative isolate flex w-full max-w-md items-start gap-2 overflow-hidden
        rounded-lg border border-red-300 bg-red-50/80 p-4 pr-6 text-sm text-red-800
        shadow-lg backdrop-blur
        transition-all duration-300 ease-out
        ${show ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}
      `}
    >
      {/* Left accent bar */}
      <span className="absolute ltr:left-0 rtl:right-0 top-0 h-full w-1 bg-gradient-to-b from-red-500 to-red-400" />

      {/* Icon */}
      <AlertTriangle className="mt-0.5 h-5 w-5 flex-none" />

      {/* Message text */}
      <span className="grow leading-5 ltr:text-left rtl:text-right">
        {message}
      </span>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissedForMessage(message)}
        aria-label={t("inlineError.dismiss")} 
        className="
          absolute ltr:right-2 rtl:left-2 top-2 rounded p-1 text-red-600/70
          hover:bg-red-100 hover:text-red-700 focus:outline-none
          focus-visible:ring focus-visible:ring-red-500/50
        "
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
