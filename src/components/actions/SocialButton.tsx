// src/components/actions/SocialButton.tsx
import * as React from "react";
import { useT } from "@ciscode/ui-translate-core";
import { SocialButtonProps } from "../../models/Type";

export const SocialButton: React.FC<SocialButtonProps> = ({ icon, label }) => {
  const t = useT("authLib"); // assuming "auth" namespace for these labels

  return (
    <div className="flex gap-5 px-8 py-3 items-center bg-indigo-50 rounded-lg max-md:px-5">
      <img
        loading="lazy"
        src={icon}
        alt={label ? t(label) : ""}
        className="object-contain shrink-0 aspect-square w-[26px]"
      />
      {label && (
        <div className="basis-auto text-sm hidden md:block ltr:text-left rtl:text-right">
          {t(label)}
        </div>
      )}
    </div>
  );
};
