// src/components/actions/InputField.tsx
import * as React from "react";
import { InputFieldProps } from "../../models/Type";

/**
 * InputField:
 * - Renders a label + input combination
 * - Accepts props for label, type, placeholder, color (i.e. Tailwind classes), etc.
 */
export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  color = "",
  value,
  onChange,
}) => {
  return (
    <div className="mt-8">
      {label && (
        <label
          htmlFor={`input-${label}`}
          className="self-start text-base text-black block"
        >
          {label}
        </label>
      )}
      <input
        id={`input-${label}`}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`px-4 py-4 mt-3.5 text-sm font-light rounded-lg border border-solid w-full ${color}`}
      />
    </div>
  );
};
