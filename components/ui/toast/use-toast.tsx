"use client"
import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 2000000

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  duration?: number
  /**
   * @default "foreground"
   */
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: Toast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<Toast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: Toast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId: Toast["id"]
    }

type State = { toasts: Toast[] }

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      }

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action
      // ! If toastId exist, dismiss only one toast, else dismiss all toasts
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) => (t.id === toastId ? { ...t, open: false } : t)),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }
    }
    case actionTypes.REMOVE_TOAST:
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const DEFAULT_STATE: State = {
  toasts: [],
}

type ToastContextType = State & {
  toast: (props: Toast) => void
  dismiss: (toastId?: string) => void
  update: (toast: Partial<Toast>) => void
  remove: (toastId: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

type ToastProviderProps = {
  children: React.ReactNode
}

function ToastProvider({ children }: ToastProviderProps) {
  const [state, dispatch] = React.useReducer(reducer, DEFAULT_STATE)

  const toast = () => {}

  const dismiss = () => {}

  const update = () => {}

  const remove = () => {}

  const value = React.useMemo(
    () => ({
      ...state,
      toast,
      dismiss,
      update,
      remove,
    }),
    [state]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within a ToastProvider")
  return context
}

export { ToastProvider, useToast, type Toast }
