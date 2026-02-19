import { ToastHost } from "./manga_narrator/components/common/ToastHost"

export default function MangaNarratorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-black text-white min-h-screen">
            {children}
            <ToastHost
            />
        </div>
    )
}
