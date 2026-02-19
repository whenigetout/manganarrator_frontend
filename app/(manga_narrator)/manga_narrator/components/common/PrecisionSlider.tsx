interface PrecisionSliderProps {
    label: string
    value: number
    min?: number
    max?: number
    step?: number          // base step (default 1)
    bigStep?: number       // shift-step (default 10)
    sliderStep?: number    // coarse slider step (default = bigStep)
    showSlider?: boolean
    onChange: (v: number) => void
}

export const PrecisionSlider = ({
    label,
    value,
    min = 0,
    max = 100,
    step = 1,
    bigStep = 10,
    sliderStep,
    showSlider = true,
    onChange
}: PrecisionSliderProps) => {

    const clamp = (v: number) =>
        Math.min(max, Math.max(min, v))

    const apply = (v: number) =>
        onChange(clamp(v))

    return (
        <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{label}</span>

                <input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    className="w-20 border rounded px-1 py-0.5
                        bg-white text-black
                        dark:bg-gray-900 dark:text-white"
                    onChange={(e) => apply(+e.target.value)}
                    onWheel={(e) => {
                        e.preventDefault()
                        const delta = e.shiftKey ? bigStep : step
                        apply(value + (e.deltaY < 0 ? delta : -delta))
                    }}
                />
            </div>

            <div className="flex gap-1">
                <button onClick={() => apply(value - step)}>−{step}</button>
                <button onClick={() => apply(value + step)}>+{step}</button>
                <button onClick={() => apply(value - bigStep)}>−{bigStep}</button>
                <button onClick={() => apply(value + bigStep)}>+{bigStep}</button>
            </div>

            {showSlider && (
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={sliderStep ?? bigStep}
                    value={value}
                    className="w-full h-2 accent-blue-500"
                    onChange={(e) => apply(+e.target.value)}
                />
            )}
        </div>
    )
}
