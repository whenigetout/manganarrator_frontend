import { useEffect, useState } from "react"
import { TTSInput, TTSOutput, MediaRef, MediaNamespace } from "@manganarrator/contracts"
import { fetchLatestTTSAudio } from "../../server/fetchLatestTTSAudio"

export const useTTSLine = (
    run_id: string,
    dlg_id: number,
    img_file: MediaRef
) => {
    const [audioRef, setAudioRef] = useState<MediaRef>({
        namespace: MediaNamespace.OUTPUTS,
        path: ""
    })
    const [useCustom, setUseCustom] = useState<boolean>(false)
    const [cfg, setCfg] = useState<string>("")
    const [exg, setExg] = useState<string>("")
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load latest version audio file if exists, only ONCE on mount
    useEffect(() => {

        setLoading(true)
        setError(null)

        fetchLatestTTSAudio(run_id, dlg_id, img_file)
            .then(data => {
                const latestAudioRef: MediaRef = {
                    namespace: MediaNamespace.OUTPUTS,
                    path: data.audio_path ?? ""
                };
                setAudioRef(latestAudioRef);
            })
            .catch((err) => {
                console.error(err);
                setError(err?.message ?? 'Failed to load Audio File');
            })
            .finally(() => setLoading(false));

    }, [])

    return {
        audioRef,
        setAudioRef,
        useCustom,
        setUseCustom,
        cfg,
        setCfg,
        exg,
        setExg,
        loading,
        error,
        reset: () => setAudioRef({
            namespace: MediaNamespace.OUTPUTS,
            path: ""
        })
    }

}
