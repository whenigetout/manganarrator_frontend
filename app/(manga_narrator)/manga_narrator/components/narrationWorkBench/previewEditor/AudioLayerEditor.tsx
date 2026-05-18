import { MediaNamespace } from "@manganarrator/contracts";
import type { AudioLayer } from "../../../types/videoPreviewEditor";

interface AudioLayerEditorProps {
    title: string;
    layers: AudioLayer[];
    onChange: (next: AudioLayer[]) => void;
    onAdd: () => void;
}

export function AudioLayerEditor({
    title,
    layers,
    onChange,
    onAdd,
}: AudioLayerEditorProps) {
    const updateLayer = (layerId: string, updates: Partial<AudioLayer>) => {
        onChange(layers.map(layer => (
            layer.id === layerId
                ? { ...layer, ...updates }
                : layer
        )));
    };

    const removeLayer = (layerId: string) => {
        onChange(layers.filter(layer => layer.id !== layerId));
    };

    return (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 space-y-3">
            <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-medium text-zinc-100">{title}</h4>
                <button
                    type="button"
                    onClick={onAdd}
                    className="rounded bg-emerald-700 px-2 py-1 text-xs text-white hover:bg-emerald-600"
                >
                    Add Audio
                </button>
            </div>

            {layers.length === 0 && (
                <p className="text-xs text-zinc-500">
                    No extra audio layers yet.
                </p>
            )}

            {layers.map(layer => (
                <div key={layer.id} className="grid gap-2 rounded border border-zinc-800 bg-zinc-900/70 p-3 md:grid-cols-6">
                    <input
                        value={layer.label}
                        onChange={(e) => updateLayer(layer.id, { label: e.target.value })}
                        placeholder="Label"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <select
                        value={layer.media_ref.namespace}
                        onChange={(e) => updateLayer(layer.id, {
                            media_ref: {
                                ...layer.media_ref,
                                namespace: e.target.value as MediaNamespace,
                            },
                        })}
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    >
                        <option value={MediaNamespace.INPUTS}>inputs</option>
                        <option value={MediaNamespace.OUTPUTS}>outputs</option>
                    </select>
                    <input
                        value={layer.media_ref.path}
                        onChange={(e) => updateLayer(layer.id, {
                            media_ref: {
                                ...layer.media_ref,
                                path: e.target.value,
                            },
                        })}
                        placeholder="Relative audio path"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100 md:col-span-2"
                    />
                    <input
                        type="number"
                        step="0.1"
                        value={layer.start_at}
                        onChange={(e) => updateLayer(layer.id, { start_at: Number(e.target.value) })}
                        placeholder="Start"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <input
                        type="number"
                        step="0.1"
                        value={layer.volume}
                        onChange={(e) => updateLayer(layer.id, { volume: Number(e.target.value) })}
                        placeholder="Volume"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />

                    <input
                        type="number"
                        step="0.1"
                        value={layer.trim_start_sec}
                        onChange={(e) => updateLayer(layer.id, { trim_start_sec: Number(e.target.value) })}
                        placeholder="Trim start"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <input
                        type="number"
                        step="0.1"
                        value={layer.trim_end_sec ?? ""}
                        onChange={(e) => updateLayer(layer.id, {
                            trim_end_sec: e.target.value === "" ? null : Number(e.target.value),
                        })}
                        placeholder="Trim end"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <input
                        type="number"
                        step="0.1"
                        value={layer.fade_in_sec}
                        onChange={(e) => updateLayer(layer.id, { fade_in_sec: Number(e.target.value) })}
                        placeholder="Fade in"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <input
                        type="number"
                        step="0.1"
                        value={layer.fade_out_sec}
                        onChange={(e) => updateLayer(layer.id, { fade_out_sec: Number(e.target.value) })}
                        placeholder="Fade out"
                        className="rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-100"
                    />
                    <label className="flex items-center gap-2 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-sm text-zinc-200">
                        <input
                            type="checkbox"
                            checked={layer.loop}
                            onChange={(e) => updateLayer(layer.id, { loop: e.target.checked })}
                        />
                        Loop
                    </label>
                    <div className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-950 px-2 py-1">
                        <label className="flex items-center gap-2 text-sm text-zinc-200">
                            <input
                                type="checkbox"
                                checked={layer.enabled}
                                onChange={(e) => updateLayer(layer.id, { enabled: e.target.checked })}
                            />
                            Enabled
                        </label>
                        <button
                            type="button"
                            onClick={() => removeLayer(layer.id)}
                            className="text-xs text-red-300 hover:text-red-200"
                        >
                            Remove
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
