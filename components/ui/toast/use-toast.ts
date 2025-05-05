"use client"
import * as React from "react"
import { useCallback } from "react"

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

interface State {
  toasts: Toast[]
}

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
  toast: ({ ...props }: Toast) => void
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

  const toast = useCallback(
    ({ ...props }: Toast) => {
      const id = props.id || String(Math.random())

      const update = (toast: Partial<Toast>) => {
        dispatch({
          type: actionTypes.UPDATE_TOAST,
          toast: { ...toast, id },
        })
      }

      const dismiss = () => {
        dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
      }

      dispatch({
        type: actionTypes.ADD_TOAST,
        toast: {
          ...props,
          id,
          open: true,
          onOpenChange: (open) => {
            if (!open) dismiss()
          },
        },
      })

      if (props.duration !== null) {
        toastTimeouts.set(
          id,
          setTimeout(() => {
            dispatch({ type: actionTypes.DISMISS_TOAST, toastId: id })
          }, props.duration || TOAST_REMOVE_DELAY),
        )
      }

      return {
        id: id,
        update: update,
        dismiss: dismiss,
      }
    },
    [dispatch],
  )

  const dismiss = useCallback(
    (toastId?: string) => {
      dispatch({ type: actionTypes.DISMISS_TOAST, toastId: toastId })
    },
    [dispatch],
  )

  const update = useCallback(
    (toast: Partial<Toast>) => {
      dispatch({ type: actionTypes.UPDATE_TOAST, toast: toast })
    },
    [dispatch],
  )

  const remove = useCallback(
    (toastId: string) => {
      dispatch({ type: actionTypes.REMOVE_TOAST, toastId: toastId })
    },
    [dispatch],
  )

  React.useEffect(() => {
    return () => {
      state.toasts.forEach((toast) => {
        const timeout = toastTimeouts.get(toast.id)
        if (timeout) {
          clearTimeout(timeout)
        }
      })
    }
  }, [state.toasts])

  const value = React.useMemo(
    () => ({
      ...state,
      toast,
      dismiss,
      update,
      remove,
    }),
    [state, toast, dismiss, update, remove]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

function useToast() {
  const context = React.useContext(ToastContext)
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export { ToastProvider, useToast, type Toast }
