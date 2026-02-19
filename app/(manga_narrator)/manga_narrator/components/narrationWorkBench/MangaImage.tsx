import { EditAction, EditActionType } from "../../types/EditActionType"
import { ImageDialogueLine } from "./ImageDialogueLine"
import { OCRImage, MediaRef } from "@manganarrator/contracts"
import { useState, useEffect } from "react"
import { fileNameFromMediaRef } from "../../utils/helpers"
import { ImagePanPreview } from "./ImagePanPreview"
import { ImageSegmentPreview } from "./ImageSegmentPreview"
import { useVideoPreviewJson } from "../../client/hooks/useVideoPreviewJson"

interface MangaImageProps {
    run_id: string
    json_file: MediaRef
    image: OCRImage
    imageIdx: number
    dispatchEdit: (action: EditAction) => void
    saveJson: () => void
    savePreview: () => void
}
export const MangaImage = ({
    run_id,
    json_file,
    image,
    imageIdx,
    dispatchEdit,
    saveJson,
    savePreview
}: MangaImageProps) => {

    const {
        data,
        imgPrwById,
        loading,
        error
    } = useVideoPreviewJson(json_file)

    type PreviewMode = "bbox" | "video";

    const [previewMode, setPreviewMode] = useState<PreviewMode>("bbox");

    // index into the flattened segment preview list
    const [activePreviewIdx, setActivePreviewIdx] = useState(0);

    // for expand/collapse logic
    const [expandAll, setExpandAll] = useState<boolean>(false);
    // for img pan preview
    const [activeDlgIdx, setActiveDlgIdx] = useState(0)

    function nextActiveDlgIdx(
        deletedIdx: number,
        newLength: number
    ): number {
        if (newLength <= 0) return 0;

        // If deleted last item, move left
        if (deletedIdx >= newLength) {
            return newLength - 1;
        }

        // Otherwise, same index now points to next item
        return deletedIdx;
    }

    const handleDeleteDialogue = (dlgIdx: number) => {
        const prevLength = image.dialogue_lines.length;

        dispatchEdit({
            type: EditActionType.Dialogue_delete,
            imageIdx,
            dlgIdx,
            updates: null
        })

        const newLength = prevLength - 1;

        setActiveDlgIdx(
            nextActiveDlgIdx(dlgIdx, newLength)
        );
    }


    return (

        <div className="bg-zinc-900 rounded-lg p-4 shadow space-y-4">
            <div className="text-sm text-zinc-400">
                Image · <span className="text-zinc-200">{fileNameFromMediaRef(image.image_info.image_ref)}</span>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => setExpandAll(v => !v)}
                    className="text-xs px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700"
                >
                    {expandAll ? "Collapse All" : "Expand All"}
                </button>
            </div>

            <div className="grid grid-cols-[1fr_1.5fr] gap-6 px-6" >
                {/* LEFT: scrolls */}
                <div className="max-h-[calc(100vh-6rem)] overflow-y-auto min-w-0">
                    {image.dialogue_lines.map((dlgLine, dlgIdx) =>

                        <ImageDialogueLine
                            key={dlgLine.id}
                            run_id={run_id}
                            json_file={json_file}
                            image_ref={image.image_info.image_ref}
                            dlgLine={dlgLine}
                            imageIdx={imageIdx}
                            dlgIdx={dlgIdx}
                            dispatchEdit={dispatchEdit}
                            forceExpand={expandAll}
                            onDlgClick={setActiveDlgIdx}
                            onDelete={handleDeleteDialogue}
                            activeDlgIdx={activeDlgIdx}
                        />

                    )}
                </div>
                {/* RIGHT: sticks */}
                <div className="flex justify-center">
                    <div className="sticky top-4">
                        <div className="flex gap-2 mb-2">
                            {
                                data &&
                                (<button
                                    onClick={() => setPreviewMode(
                                        previewMode === "bbox" ?
                                            "video" :
                                            "bbox"
                                    )}
                                    className={`text-xs px-2 py-1 rounded ${previewMode === "bbox" ? "bg-zinc-700" : "bg-zinc-800"
                                        }`}
                                >
                                    {
                                        previewMode === "bbox" ?
                                            "Switch to Video Preview" :
                                            "Switch to BBox Editor"
                                    }
                                </button>)
                            }

                        </div>

                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => savePreview()}
                                className={`text-xs px-2 py-1 rounded ${previewMode === "bbox" ? "bg-zinc-700" : "bg-zinc-800"
                                    }`}
                            >
                                {
                                    data ?
                                        "Update Preview" :
                                        "Save Preview"
                                }
                            </button>

                        </div>

                        {previewMode === "bbox" ? (
                            <ImagePanPreview
                                key={image.image_id}
                                image={image}
                                imageIdx={imageIdx}
                                activeDlgIdx={activeDlgIdx}
                                dispatchEdit={dispatchEdit}
                                saveJson={saveJson}
                            />
                        ) : (imgPrwById && imgPrwById.has(image.image_id) &&
                            <ImageSegmentPreview
                                imagePreview={imgPrwById.get(image.image_id)!}
                                activeIdx={activePreviewIdx}
                                onPrev={() => setActivePreviewIdx(i => i - 1)}
                                onNext={() => setActivePreviewIdx(i => i + 1)}
                            />
                        )}

                    </div>
                </div>
            </div>
        </div>
    )
}
