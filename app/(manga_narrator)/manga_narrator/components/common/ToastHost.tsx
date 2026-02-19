'use client';

import { useEffect, useState } from "react"

type ToastMsg = {
    id: number
    text: string
    duration: number
}

let pushToast: (msg: string, duration?: number) => void

export const toast = (msg: string, duration = 2000) => {
    pushToast?.(msg, duration)
}

export const ToastHost = () => {
    const [toasts, setToasts] = useState<ToastMsg[]>([])

    useEffect(() => {
        pushToast = (text, duration = 2000) => {
            const id = Date.now()
            setToasts((t) => [...t, { id, text, duration }])

            setTimeout(() => {
                setToasts((t) => t.filter((x) => x.id !== id))
            }, duration)
        }
    }, [])

    return (
        <div className="fixed bottom-6 right-6 z-50 space-y-2">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className="bg-zinc-900 text-white px-4 py-2 rounded shadow text-sm animate-fade-in"
                >
                    {t.text}
                </div>
            ))}
        </div>
    )
}
