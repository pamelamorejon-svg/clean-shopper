import Button from './Button'

export default function EmptyState({ heading, description, icon, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-space-2xl px-space-lg gap-space-lg">
      {icon && (
        <div className="text-neutral-400">
          {icon}
        </div>
      )}
      <h3 className="text-h3 font-cormorant text-neutral-900">{heading}</h3>
      <p className="text-body font-jost text-neutral-600 max-w-sm">{description}</p>
      {action && (
        <div className="mt-space-md">
          <Button variant={action.variant ?? 'primary'} onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
