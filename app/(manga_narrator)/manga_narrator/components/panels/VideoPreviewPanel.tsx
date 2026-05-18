import type { ImagePreviewEditor } from "../../types/videoPreviewEditor";
import { resolveMediaRef } from "../../utils/helpers";

export default function VideoPreviewPanel({
    runId,
    onRunIdChange,
    onLoad,
    loading,
    error,
    imagePreviews,
}: any) {
    return (
        <div className="mt-12 border-t pt-6">
            <h2 className="text-xl font-semibold mb-2">
                🎬 Video Pan Preview
            </h2>

            <div className="flex gap-2 mb-4">
                <input
                    value={runId}
                    onChange={(e) => onRunIdChange(e.target.value)}
                    placeholder="Enter run_id"
                    className="flex-1 px-3 py-2 border rounded bg-gray-900 text-gray-200"
                />
                <button
                    onClick={onLoad}
                    className="bg-green-600 px-4 py-2 rounded text-white"
                >
                    Load Preview
                </button>
            </div>

            {loading && <p className="text-gray-400">Loading…</p>}
            {error && <p className="text-red-500">{error}</p>}

            {imagePreviews && (
                <div className="mt-6 space-y-10">
                    {imagePreviews.map((image: ImagePreviewEditor) => (
                        <div key={image.image_id}>
                            <h3 className="text-lg font-semibold mb-3">
                                🖼 Image {image.image_id}
                            </h3>

                            <video
                                src={resolveMediaRef(image.out_file_ref)}
                                controls
                                className="w-full max-w-xl rounded border border-zinc-700 bg-black"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
