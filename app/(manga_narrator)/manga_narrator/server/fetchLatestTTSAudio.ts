const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string
import { MediaRef, LatestTTSResponse } from "@manganarrator/contracts"

export const fetchLatestTTSAudio = async (
    run_id: string,
    dlg_id: number,
    img_file: MediaRef
): Promise<LatestTTSResponse> => {
    const url = `${BACKEND_API}/api/manga/latest_audio/?run_id=${run_id}&dlg_id=${dlg_id}&namespace=${img_file.namespace}&path=${encodeURIComponent(img_file.path)}`
    const res = await fetch(
        url
    )

    if (!res.ok) {
        throw Error(`Bad response from /api/manga/latest_audio, req url: ${url}`)
    }

    return res.json()

}