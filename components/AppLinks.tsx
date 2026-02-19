import Link from "next/link"

type AppLink = {
    name: string
    path: string
    note?: string
}

const appURLs: AppLink[] = [
    {
        name: "manganarrator",
        path: "/manga_narrator"
    },
    {
        name: "league tracker",
        path: "/league_tracker"
    },
    {
        name: "mediahub",
        path: "/mediahub",
        note: `MediaHub is currently paused.
The concept was explored separately, and development here has been discontinued for now.`
    }
]

export const AppLinks = () => {
    return (
        <div className="w-full max-w-md mt-8">
            <h2 className="text-lg font-semibold mb-4 text-center sm:text-left">
                🚀 My Apps
            </h2>

            <ul className="space-y-4">
                {appURLs.map(({ name, path, note }) => (
                    <li
                        key={name}
                        className="rounded-lg border border-black/10 dark:border-white/15"
                    >
                        <Link
                            href={path}
                            className="
                block px-4 py-3 transition-all
                hover:bg-black/[0.03] dark:hover:bg-white/[0.05]
              "
                        >
                            <div className="font-medium capitalize">{name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Open {name}
                            </div>
                        </Link>

                        {/* Optional note — only renders if present */}
                        {note && (
                            <div className="
                px-4 pb-3 pt-2
                text-xs text-amber-700 dark:text-amber-400
                bg-amber-50/50 dark:bg-amber-900/10
                border-t border-black/5 dark:border-white/10
                whitespace-pre-line
              ">
                                {note}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    )
}
