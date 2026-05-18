import Link from "next/link";

export default async function Page() {
    return (
        <div className="p-6">
            <Link className="text-lg underline text-green-400" href={"/manga_narrator"}>
                Manga Narrator Home
            </Link>
        </div>
    );
}
