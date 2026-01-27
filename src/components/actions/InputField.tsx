// src/components/actions/InputField.tsx
import * as React from "react";
import { useT } from "@ciscode/ui-translate-core";
import { InputFieldProps } from "../../models/Type";

/**
 * InputField:
 * - Renders a label + input combination
 * - Uses translation keys for both `label` and `placeholder`
 * - Automatically flips text alignment in RTL
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,          // translation key for the label
  type = "text",
  placeholder,    // translation key for the placeholder
  color = "",
  value,
  onChange,
}) => {
  const t = useT("authLib");  // assumes your translations live under the "auth" namespace

  return (
    <div className="mt-8 flex flex-col">
      {label && (
        <label
          htmlFor={`input-${label}`}
          className="self-start text-base text-black dark:text-white block ltr:text-left rtl:text-right"
        >
          {t(label)}
        </label>
      )}
      <input
        id={`input-${label}`}
        type={type}
        placeholder={placeholder ? t(placeholder) : undefined}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`
          px-4 py-4 mt-3.5 text-sm font-light rounded-lg border border-solid w-full
          ltr:text-left rtl:text-right
          ${color}
        `}
      />
    </div>
  );
};
