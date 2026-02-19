import { useEffect } from "react"

interface ToastProps {
    message: string
    duration?: number // ms
    onClose: () => void
}

export const Toast = ({ message, duration = 2000, onClose }: ToastProps) => {
    useEffect(() => {
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [duration, onClose])

    return (
        <div className="
      fixed bottom-6 right-6 z-50
      bg-zinc-900 text-white
      px-4 py-2 rounded shadow-lg
      text-sm
      animate-fade-in
    ">
            {message}
        </div>
    )
}
