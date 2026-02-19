interface CustomEmotionParamsProps {
    useCustom: boolean
    setUseCustom: (toggle: boolean) => void
    exg: string
    setExg: (exg: string) => void
    cfg: string
    setCfg: (cfg: string) => void
}

export const CustomEmotionParams = ({
    useCustom,
    setUseCustom,
    exg,
    setExg,
    cfg,
    setCfg
}: CustomEmotionParamsProps) => {
    return (
        <div>
            {/* Custom Emotion Settings */}
            <div className="mt-3 border border-zinc-700 rounded p-2 space-y-2">
                {/* Toggle */}
                <div className="bg-zinc-800 rounded p-2 space-y-2">
                    <label className="text-xs uppercase tracking-wide text-zinc-400">
                        <input
                            type="checkbox"
                            checked={useCustom}
                            onChange={(e) => setUseCustom(e.target.checked)}
                            className="accent-blue-500"
                        />
                        <span>Use custom emotion parameters</span>
                    </label>
                </div>

                {/* Params */}
                <div
                    className={`grid grid-cols-2 gap-2 transition-opacity ${useCustom ? "opacity-100" : "opacity-50"
                        }`}
                >
                    {/* Exaggeration */}
                    <div className="flex flex-col">
                        <label className="text-xs text-zinc-400 mb-1">
                            Exaggeration
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={exg}
                            disabled={!useCustom}
                            onChange={(e) => setExg(e.target.value)}
                            className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm disabled:cursor-not-allowed"
                        />
                    </div>

                    {/* CFG */}
                    <div className="flex flex-col">
                        <label className="text-xs text-zinc-400 mb-1">
                            CFG
                        </label>
                        <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={cfg}
                            disabled={!useCustom}
                            onChange={(e) => setCfg(e.target.value)}
                            className="bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-sm disabled:cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

        </div>
    )
}
