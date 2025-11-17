import { useState } from 'react'

interface ConfirmationState {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  onConfirm: () => void
  variant: 'destructive' | 'default'
}

export function useConfirmation() {
  const [state, setState] = useState<ConfirmationState>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Continue',
    cancelLabel: 'Cancel',
    onConfirm: () => {},
    variant: 'default',
  })

  const confirm = (options: {
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'destructive' | 'default'
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: options.title,
        description: options.description,
        confirmLabel: options.confirmLabel || 'Continue',
        cancelLabel: options.cancelLabel || 'Cancel',
        variant: options.variant || 'default',
        onConfirm: () => {
          resolve(true)
          setState((prev) => ({ ...prev, open: false }))
        },
      })
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setState((prev) => ({ ...prev, open: false }))
    }
  }

  return {
    confirm,
    confirmationState: state,
    handleOpenChange,
  }
}
