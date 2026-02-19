import { MangaDirViewResponse, MediaRef } from '@manganarrator/contracts'

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string

export const fetchDir = async (
    mediaRef: MediaRef
): Promise<MangaDirViewResponse> => {
    const res = await fetch(
        `${BACKEND_API}/api/manga/dir/?namespace=${mediaRef.namespace}&path=${encodeURIComponent(mediaRef.path)}`
    )

    if (!res.ok) {
        throw new Error("Bad response")
    }


    return res.json()
}
