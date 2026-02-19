import { useTTSLine } from "../../../client/hooks/useTTSLine"
import { useTTSEngine } from "../../../client/hooks/useTTSEngine"
import { TTSInput, EmotionParams, OCRRun, MediaRef, DialogueLine } from "@manganarrator/contracts"
import { GenerateTTSButton } from "./TTSLineParts/GenerateTTSButton"
import { Message } from "../../common/Message"
import { CustomEmotionParams } from "./TTSLineParts/CustomEmotionParams"
import { getTTSLineState, updateTTSLineState } from "../../../shared/ttsLineStateStore"
import { useState, useEffect } from "react"
import { buildTTSInput } from "../../../utils/buildTTSInput"
import { safeFloat } from "../../../utils/helpers"
import { AudioRecorder } from "./TTSLineParts/AudioRecorder"
import { saveRecordedAudio } from "../../../server/save_recorded_audio"

interface TTSLineProps {
    run_id: string
    json_file: MediaRef
    image_ref: MediaRef
    dlgLine: DialogueLine
}

export const TTSLine = ({
    run_id,
    json_file,
    image_ref,
    dlgLine
}: TTSLineProps) => {

    const handleSaveRecordedAudio = async (blob: Blob | null) => {
        if (!blob) return
        try {
            const res = await saveRecordedAudio({
                run_id,
                dialogue_id: dlgLine.id,
                image_ref,
                media_type: "audio",
                ext: "wav",
                suffix: "recorded",
                source: "mic",
                audio_blob: blob,
            });

            setAudioRef(res.audio_ref)

            // IMPORTANT:
            // You do NOT need to manually update audioRef.
            // Your existing useTTSLine hook already:
            //   - fetches latest audio
            //   - picks highest version
            // So just let it revalidate naturally.
        } catch (err) {
            console.error("Failed to save recorded audio", err);
        }
    };

    const persisted = getTTSLineState(dlgLine.id)

    const [persistedCfg, setPersistedCfg] = useState(persisted.cfg)
    const [persistedExg, setPersistedExg] = useState(persisted.exg)
    const [persistedUseCustom, setPersistedUseCustom] = useState(persisted.useCustom)

    const [isGeneratingTTS, setIsGeneratingTTS] = useState<boolean>(false)

    useEffect(() => {
        updateTTSLineState(dlgLine.id, {
            cfg: persistedCfg,
            exg: persistedExg,
            useCustom: persistedUseCustom,
        })
    }, [persistedCfg, persistedExg, persistedUseCustom, dlgLine.id])


    const {
        generateOne
    } = useTTSEngine();

    const {
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
        reset
    } = useTTSLine(run_id, dlgLine.id, image_ref);



    const handleGenerateTTS = async () => {

        setIsGeneratingTTS(true)

        const req = buildTTSInput(
            dlgLine,
            safeFloat,
            exg,
            cfg,
            image_ref,
            useCustom,
            run_id
        )

        generateOne(req)
            .then(data => setAudioRef(data.audio_ref))
            .catch()
            .finally(() => setIsGeneratingTTS(false))


    }

    return (
        <div className="bg-zinc-900/60 rounded-md p-3 space-y-3 border border-zinc-700">

            <CustomEmotionParams
                cfg={cfg}
                exg={exg}
                useCustom={useCustom}
                setCfg={setCfg}
                setExg={setExg}
                setUseCustom={setUseCustom}
            />

            <div className="flex items-center gap-3">
                <GenerateTTSButton
                    audioRef={audioRef}
                    loading={loading}
                    isGenerating={isGeneratingTTS}
                    onGenerateTTS={handleGenerateTTS}
                />
                <AudioRecorder
                    run_id={run_id}
                    dlgLine={dlgLine}
                    image_ref={image_ref}
                    onSave={handleSaveRecordedAudio}
                />

            </div>

            <Message
                text={error ?? ""}
                tone="error"
            />
        </div>
    )
}
