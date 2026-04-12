export default function InputField({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  hint,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <div className="flex flex-col gap-space-xs">
      <label
        htmlFor={id}
        className={`text-h4 font-jost ${disabled ? 'text-neutral-400' : 'text-neutral-900'}`}
      >
        {label}
        {required && <span className="text-error ml-space-xs">*</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={[
          'w-full bg-neutral-100 rounded-radius-md px-space-md py-space-md',
          'text-body font-jost text-neutral-900 placeholder:text-neutral-400',
          'border focus:outline-none focus:border-primary-dark focus:shadow-md transition-shadow duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error ? 'border-error' : 'border-neutral-200',
        ].join(' ')}
      />
      {(error || hint) && (
        <p className={`text-micro font-jost ${error ? 'text-error' : 'text-neutral-600'}`}>
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
