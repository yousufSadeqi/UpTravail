interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'tel' | 'number' | 'email' | 'textarea';
  required?: boolean;
  rows?: number;
  error?: string;
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  required,
  rows,
  error
}: FormFieldProps) {
  const inputClasses = `
    mt-1 block w-full rounded-md border px-3 py-2 bg-white
    focus:outline-none focus:ring-primary
    text-gray-900 placeholder-gray-400
    ${error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-300 focus:border-primary'
    }
  `;

  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          className={inputClasses}
          style={{ color: 'black' }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className={inputClasses}
          style={{ color: 'black' }}
        />
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </label>
  );
} 