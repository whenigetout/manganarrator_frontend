import { OCR_STATUS, OcrStatus } from "../../shared/status_enums"

interface RunOCRButtonProps {
    status: OcrStatus
    onRun: () => void
    disabled?: boolean
}

const RunOCRButton = ({ status, onRun, disabled = false }: RunOCRButtonProps) => {
    const isProcessing = status === OCR_STATUS.PROCESSING;
    const isDisabled = disabled || isProcessing;

    return (
        <button
            type="button"
            onClick={onRun}
            disabled={isDisabled}
            className="mr-2 rounded bg-purple-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-zinc-500"
        >
            {isProcessing ? "Running OCR..." : "Run OCR"}
        </button>
    )
}

export default RunOCRButton