"use client"

import { useState } from "react"
import { fetchVideoPreviews } from "../server/fetchVideoPreviews"
import type { ImagePreviewEditor } from "../types/videoPreviewEditor"
import VideoPreviewPanel from "../components/panels/VideoPreviewPanel"

export default function VideoPreviewClient() {
    const [runId, setRunId] = useState("")
    const [imagePreviews, setImagePreviews] = useState<ImagePreviewEditor[] | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    async function load() {
        if (!runId.trim()) return

        setLoading(true)
        setError(null)

        try {
            const previews = await fetchVideoPreviews(runId)
            setImagePreviews(previews)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load video previews")
        } finally {
            setLoading(false)
        }
    }

    return (
        <VideoPreviewPanel
            runId={runId}
            onRunIdChange={setRunId}
            onLoad={load}
            loading={loading}
            error={error}
            imagePreviews={imagePreviews}
        />
    )
}
