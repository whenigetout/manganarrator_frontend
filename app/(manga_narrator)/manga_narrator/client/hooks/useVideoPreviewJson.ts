import { useEffect, useMemo, useState } from "react";
import { MediaRef } from "@manganarrator/contracts";
import {
    buildImageFromPreview,
    buildSegmentFromPreview,
    buildVideoFromPreview,
    loadEditableVideoPreview,
    loadVideoJob,
    saveEditableVideoPreview,
} from "../../server/videoPreviewEditor";
import type {
    AudioLayer,
    ImagePreviewEditor,
    SegmentPreviewEditor,
    VideoJobResponse,
    VideoPreviewEditor,
} from "../../types/videoPreviewEditor";

interface BuildJobState {
    label: string;
    status: VideoJobResponse["status"];
    result?: VideoJobResponse["result"];
    error?: string;
}

const cloneDeep = <T,>(value: T): T => JSON.parse(JSON.stringify(value));

export function useVideoPreviewJson(json_file: MediaRef | null) {
    const [data, setData] = useState<VideoPreviewEditor | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jobs, setJobs] = useState<Record<string, BuildJobState>>({});

    const imgPrwById = useMemo(() => {
        if (!data) return null;
        return new Map(data.image_previews.map(preview => [preview.image_id, preview]));
    }, [data]);

    const loadPreview = async () => {
        if (!json_file) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const preview = await loadEditableVideoPreview(json_file);
            setData(normalizePreview(preview));
        } catch {
            setError("Preview JSON not found / error.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPreview();
    }, [json_file]);

    const updatePreview = (updater: (draft: VideoPreviewEditor) => void) => {
        setData(prev => {
            if (!prev) return prev;
            const next = cloneDeep(prev);
            updater(next);
            return normalizePreview(next);
        });
    };

    const saveEdits = async () => {
        if (!data) return;
        await saveEditableVideoPreview(data);
        await loadPreview();
    };

    const pollJob = async (jobId: string, label: string) => {
        setJobs(prev => ({
            ...prev,
            [jobId]: {
                label,
                status: "processing",
            },
        }));

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 1500));
            const status = await loadVideoJob(jobId);
            setJobs(prev => ({
                ...prev,
                [jobId]: {
                    label,
                    status: status.status,
                    result: status.result,
                    error: status.error,
                },
            }));

            if (status.status !== "processing") {
                return status;
            }
        }
    };

    const buildSegment = async (segmentPreview: SegmentPreviewEditor) => {
        const job = await buildSegmentFromPreview(segmentPreview);
        return pollJob(job.job_id, `Segment ${segmentPreview.rendered_segment.segment.segment_id}`);
    };

    const buildImage = async (imagePreview: ImagePreviewEditor) => {
        const job = await buildImageFromPreview(imagePreview);
        return pollJob(job.job_id, `Image ${imagePreview.image_id}`);
    };

    const buildVideo = async (videoPreview: VideoPreviewEditor, label = "Chapter render") => {
        const job = await buildVideoFromPreview(videoPreview);
        return pollJob(job.job_id, label);
    };

    return {
        data,
        imgPrwById,
        loading,
        error,
        jobs,
        reload: loadPreview,
        updatePreview,
        saveEdits,
        buildSegment,
        buildImage,
        buildVideo,
    };
}

function normalizePreview(preview: VideoPreviewEditor): VideoPreviewEditor {
    return {
        ...preview,
        audio_layers: preview.audio_layers ?? [],
        image_previews: preview.image_previews.map(image => ({
            ...image,
            include_in_output: image.include_in_output ?? true,
            audio_layers: image.audio_layers ?? [],
            base_timeline: image.base_timeline.map(segment => ({
                ...segment,
                include_in_output: segment.include_in_output ?? true,
                audio_layers: segment.audio_layers ?? [],
            })),
        })),
    };
}

export function createEmptyAudioLayer(namespace: MediaRef["namespace"]): AudioLayer {
    return {
        id: `layer_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`,
        label: "",
        media_ref: {
            namespace,
            path: "",
        },
        start_at: 0,
        volume: 1,
        loop: false,
        enabled: true,
        trim_start_sec: 0,
        trim_end_sec: null,
        fade_in_sec: 0,
        fade_out_sec: 0,
    };
}
