// src/models/Type.ts
export interface SocialButtonProps {
    icon: string;
    label?: string;
}

export interface InputFieldProps {
    label: string;
    type: string;
    placeholder: string;
    color: string;
    value?: string;
    onChange?: (newValue: string) => void;
}