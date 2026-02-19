import {
    DialogueText,
    EmotionDDL,
    GenderDDL,
    SpeakerDDL,
    TTSLine
} from "./DialogueLIneParts"
import { EditAction } from "../../types/EditActionType"
import { MediaRef, DialogueLine } from "@manganarrator/contracts"
import { useState, useEffect } from "react"
import clsx from "clsx"
import { text } from "node:stream/consumers"

interface ImageDialogueLineProps {
    run_id: string
    json_file: MediaRef
    image_ref: MediaRef
    dlgLine: DialogueLine
    imageIdx: number
    dlgIdx: number
    dispatchEdit: (action: EditAction) => void
    forceExpand: boolean
    onDlgClick: (idx: number) => void
    onDelete: (dlgIdx: number) => void
    activeDlgIdx: number
}

export const ImageDialogueLine = ({
    run_id,
    json_file,
    image_ref,
    dlgLine,
    imageIdx,
    dlgIdx,
    dispatchEdit,
    forceExpand,
    onDlgClick,
    onDelete,
    activeDlgIdx
}: ImageDialogueLineProps) => {

    const hasBbox = !!dlgLine.original_bbox

    const [expanded, setExpanded] = useState<boolean>(false);

    useEffect(() => {
        setExpanded(forceExpand);
    }, [forceExpand])

    return (

        < div
            onClick={() => onDlgClick(dlgIdx)
            }
            className={
                clsx(
                    "rounded-md p-3 space-y-3 cursor-pointer transition-all",
                    hasBbox
                        ? "bg-zinc-800 hover:bg-zinc-750"
                        : "bg-amber-950/30 border border-amber-500/60 ring-1 ring-amber-400/40",
                )}
        >


            <div className="flex items-start justify-between gap-3">
                <p
                    className={clsx(
                        "leading-snug flex-1",
                        hasBbox
                            ? "text-zinc-100"
                            : "text-amber-200 italic",
                        activeDlgIdx === dlgIdx && "text-amber-400"
                    )}
                >
                    {dlgLine.text}
                </p>
                {!hasBbox && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-600/20 text-amber-300 border border-amber-500/40">
                        NO BBOX
                    </span>
                )}

                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onDelete(dlgIdx)
                    }}
                    className="text-xs px-2 py-1 rounded bg-red-600/20 text-red-300 hover:bg-red-600/40"
                >
                    Delete
                </button>


                <button
                    onClick={() => setExpanded(v => !v)}
                    className="text-xs px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 shrink-0"
                >
                    {expanded ? "−" : "+"}
                </button>
            </div>


            {expanded && <>
                <p> ID: {dlgLine.id}</p>
                <div className="flex flex-wrap gap-3 text-sm">
                    <GenderDDL
                        gender={dlgLine.gender}
                        imageIdx={imageIdx}
                        dlgIdx={dlgIdx}
                        dispatchEdit={dispatchEdit}
                    />
                    <SpeakerDDL
                        speaker={dlgLine.speaker}
                        gender={dlgLine.gender}
                        imageIdx={imageIdx}
                        dlgIdx={dlgIdx}
                        dispatchEdit={dispatchEdit}
                    />

                    <EmotionDDL
                        emotion={dlgLine.emotion}
                        gender={dlgLine.gender}
                        speaker={dlgLine.speaker}
                        imageIdx={imageIdx}
                        dlgIdx={dlgIdx}
                        dispatchEdit={dispatchEdit}
                    />
                    <DialogueText
                        dialogueText={dlgLine.text}
                        imageIdx={imageIdx}
                        dlgIdx={dlgIdx}
                        dispatchEdit={dispatchEdit}
                    />
                </div>
                <TTSLine
                    run_id={run_id}
                    json_file={json_file}
                    image_ref={image_ref}
                    dlgLine={dlgLine}
                />
            </>}

        </div>
    )
}
