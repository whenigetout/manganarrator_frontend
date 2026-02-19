import Link from "next/link"

export const TestPageLink = () => {
    return (
        <div className="text-md p-4 bg-black text-green-400 mb-4">
            <Link href={"manga_narrator/dev/test"}>Go to Test Page</Link>
        </div>
    )
}
