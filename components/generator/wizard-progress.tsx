import { cn } from "@/lib/utils"

type WizardProgressProps = {
  currentStep: "upload" | "style" | "title"
  className?: string
}

export function WizardProgress({ currentStep, className }: WizardProgressProps) {
  const steps = [
    { id: "upload", label: "Upload Faces" },
    { id: "style", label: "Select Style" },
    { id: "title", label: "Add Title" },
  ]

  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = steps.findIndex((s) => s.id === currentStep) > steps.findIndex((s) => s.id === step.id)

        return (
          <div key={step.id} className="flex flex-1 items-center">
            {index > 0 && (
              <div className={cn("h-1 flex-1", isCompleted ? "bg-primary" : "bg-gray-200 dark:bg-gray-700")} />
            )}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium",
                  isActive
                    ? "bg-primary text-white"
                    : isCompleted
                      ? "bg-primary text-white"
                      : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400",
                )}
              >
                {isCompleted ? index + 1 : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  isActive ? "text-primary" : isCompleted ? "text-primary" : "text-gray-500 dark:text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-1 flex-1",
                  isCompleted && steps[index + 1].id !== currentStep ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
