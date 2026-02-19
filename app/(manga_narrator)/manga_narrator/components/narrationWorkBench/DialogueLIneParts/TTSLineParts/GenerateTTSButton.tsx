const MEDIA_ROOT = process.env.NEXT_PUBLIC_MEDIA_ROOT as string
import { MediaRef } from "@manganarrator/contracts"

interface GenerateTTSButtonProps {
    audioRef: MediaRef
    loading: boolean
    isGenerating: boolean
    onGenerateTTS: () => void
}

export const GenerateTTSButton = ({
    audioRef,
    loading,
    isGenerating,
    onGenerateTTS
}: GenerateTTSButtonProps) => {
    const audioUrl = audioRef.path
        ? `${MEDIA_ROOT}/${audioRef.namespace}/${audioRef.path}`
        : "";
    return (
        <div>
            {audioUrl ? (
                <>
                    <div className="text-sm text-green-400">🎧 Latest: <code>{audioUrl.split("/").pop()}</code> </div>
                    <audio src={audioUrl} controls className="my-2 w-full" />
                    <button
                        onClick={() => onGenerateTTS()}
                        className="bg-purple-700 text-white text-xs px-2 py-1 rounded hover:bg-purple-800"
                        disabled={loading || isGenerating}
                    >
                        {loading || isGenerating ? "🔃 Regenerating..." : "🔁 Regenerate"}
                    </button>
                </>
            ) : (
                <button
                    onClick={() => onGenerateTTS()}
                    className="bg-purple-600 hover:bg-purple-500 text-white"
                    disabled={loading || isGenerating}
                >
                    {loading || isGenerating ? "🔃 Generating..." : "🎙️ Generate"}
                </button>
            )}
        </div>
    )
}
