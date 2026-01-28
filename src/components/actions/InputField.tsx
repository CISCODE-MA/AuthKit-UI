// src/components/actions/InputField.tsx
import * as React from "react";
import { InputFieldProps } from "../../models/Type";

/**
 * InputField:
 * - Renders a label + input combination
 * - Uses translation keys for both `label` and `placeholder`
 * - Automatically flips text alignment in RTL
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  color = "",
  value,
  onChange,
}) => {
  const inputId = React.useId();

  return (
    <div className="mt-8 flex flex-col">
      {label && (
        <label
          htmlFor={inputId}
          className="self-start text-base text-black dark:text-white block ltr:text-left rtl:text-right"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder || undefined}
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
