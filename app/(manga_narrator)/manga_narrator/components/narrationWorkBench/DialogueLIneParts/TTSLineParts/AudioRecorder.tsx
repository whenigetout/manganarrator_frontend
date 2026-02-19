import { useEffect, useRef, useState } from "react"
import { MediaRef, DialogueLine } from "@manganarrator/contracts"
import { blob } from "node:stream/consumers"

type AudioRecorderProps = {
    run_id: string
    image_ref: MediaRef
    dlgLine: DialogueLine
    onSave?: (blob: Blob | null) => Promise<void>
}

export function AudioRecorder({
    run_id,
    image_ref,
    dlgLine,
    onSave
}: AudioRecorderProps) {
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])

    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const [mics, setMics] = useState<MediaDeviceInfo[]>([])
    const [selectedMic, setSelectedMic] = useState<string>("")

    /* cleanup audio URL */
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl)
        }
    }, [audioUrl])

    /* load microphones */
    useEffect(() => {
        const loadMics = async () => {
            // ensure permission so labels are visible
            await navigator.mediaDevices.getUserMedia({ audio: true })

            const devices = await navigator.mediaDevices.enumerateDevices()
            const inputs = devices.filter(d => d.kind === "audioinput")

            setMics(inputs)

            const saved = localStorage.getItem("preferredMic")
            if (saved && inputs.some(d => d.deviceId === saved)) {
                setSelectedMic(saved)
            } else if (inputs.length > 0) {
                setSelectedMic(inputs[0].deviceId)
            }
        }

        loadMics().catch(console.error)
    }, [])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: selectedMic
                ? { deviceId: { exact: selectedMic } }
                : true,
        })

        const mediaRecorder = new MediaRecorder(stream)
        chunksRef.current = []

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data)
        }

        mediaRecorder.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: "audio/webm" })
            const url = URL.createObjectURL(blob)
            setAudioUrl(url)
            setRecordedBlob(blob)
            // onRecorded?.(blob)

            // stop mic
            stream.getTracks().forEach(t => t.stop())
        }

        mediaRecorder.start()
        mediaRecorderRef.current = mediaRecorder
        setIsRecording(true)
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        mediaRecorderRef.current = null
        setIsRecording(false)
    }

    const handleSave = async () => {
        if (!recordedBlob || !onSave) return
        setSaving(true)
        await onSave(recordedBlob)
        setSaving(false)
    }

    return (
        <div className="flex flex-col gap-2 w-[260px]">
            {/* mic selector */}
            {mics.length > 0 && (
                <select
                    value={selectedMic}
                    disabled={isRecording}
                    onChange={(e) => {
                        setSelectedMic(e.target.value)
                        localStorage.setItem("preferredMic", e.target.value)
                    }}
                    className="w-[260px] max-w-full h-9 px-2 rounded bg-neutral-800 text-white text-sm truncate"
                >
                    {mics.map(mic => (
                        <option key={mic.deviceId} value={mic.deviceId}>
                            {mic.label || "Microphone"}
                        </option>
                    ))}
                </select>

            )}

            {!isRecording ? (
                <button
                    onClick={startRecording}
                    className="w-[260px] h-9 px-3 rounded  bg-red-600  text-white text-sm"
                >
                    🎙 Start Recording
                </button>

            ) : (
                <button
                    onClick={stopRecording}
                    className="w-[260px] px-3 rounded bg-grey-600 text-sm"
                >
                    ⏹ Stop Recording
                </button>
            )}

            {
                audioUrl &&
                <>
                    <audio
                        controls
                        src={audioUrl}
                        className="
    w-full max-w-[260px]
    h-8
    rounded
    bg-neutral-800
    text-sm
  "
                    />

                    <button
                        onClick={handleSave}
                        disabled={!recordedBlob || saving}
                        className={`
    inline-flex items-center gap-2
    px-3 py-1.5
    rounded-md
    text-sm font-medium
    transition-colors
    ${saving
                                ? "bg-neutral-600 cursor-wait text-white"
                                : !recordedBlob
                                    ? "bg-neutral-700 text-neutral-400 cursor-not-allowed"
                                    : "bg-emerald-600 hover:bg-emerald-700 text-white"
                            }
  `}
                    >
                        <span className="text-base">💾</span>
                        {saving ? "Saving…" : "Save Recording"}
                    </button>

                </>}

        </div>
    )
}
