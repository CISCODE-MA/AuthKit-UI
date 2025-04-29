import * as React from "react";
import { SocialButtonProps } from "../../models/Type";

export const SocialButton: React.FC<SocialButtonProps> = ({ icon, label }) => (
  <div className="flex gap-5 px-8 py-3 items-center bg-indigo-50 rounded-lg max-md:px-5">
    <img
      loading="lazy"
      src={icon}
      className="object-contain shrink-0 aspect-square w-[26px]"
      alt=""
    />
    {label && <div className="basis-auto text-sm hidden md:block">{label}</div>}
  </div>
);