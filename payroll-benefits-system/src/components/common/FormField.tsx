import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const baseInput =
  'w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-teal-500';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ label, required, children }: FieldWrapperProps) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-900">
        {label}
        {required && <span className="text-clay-600"> *</span>}
      </span>
      {children}
    </label>
  );
}

export function TextField({
  label,
  required,
  type,
  ...props
}: Omit<FieldWrapperProps, 'children'> & InputHTMLAttributes<HTMLInputElement>) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <FieldWrapper label={label} required={required}>
      {isPassword ? (
        <div className="relative">
          <input
            className={`${baseInput} pr-10`}
            type={showPassword ? 'text' : 'password'}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-500 transition hover:text-ink-900"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ) : (
        <input className={baseInput} type={type} {...props} />
      )}
    </FieldWrapper>
  );
}

export function SelectField({
  label,
  required,
  children,
  ...props
}: FieldWrapperProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldWrapper label={label} required={required}>
      <select className={baseInput} {...props}>
        {children}
      </select>
    </FieldWrapper>
  );
}

export function TextAreaField({
  label,
  required,
  ...props
}: Omit<FieldWrapperProps, 'children'> & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldWrapper label={label} required={required}>
      <textarea className={`${baseInput} min-h-24 resize-y`} {...props} />
    </FieldWrapper>
  );
}