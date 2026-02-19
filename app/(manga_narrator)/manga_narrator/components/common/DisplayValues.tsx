import clsx from "clsx"

interface DisplayValuesProps {
    displayLabel: string
    displayValue: string | number
    highlight?: boolean
}

export const DisplayValues = ({
    displayLabel,
    displayValue,
    highlight = false
}: DisplayValuesProps) => {
    const classes = clsx(
        {
            'text-yellow-400': highlight,
        }
    )
    return (
        <label className="flex justify-between items-center gap-2">
            <span className="text-green-500 font-bold">{displayLabel}:</span> <span className={classes}>{displayValue}</span>
        </label>
    )
}
