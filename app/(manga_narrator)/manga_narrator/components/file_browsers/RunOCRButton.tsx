import { OCR_STATUS, OcrStatus } from "../../shared/status_enums"

interface RunOCRButtonProps {
    status: OcrStatus
    onRun: () => void
}

const RunOCRButton = ({ status, onRun }: RunOCRButtonProps) => {
    const isProcessing = status === OCR_STATUS.PROCESSING;
    return (
        <button
            onClick={onRun}
            disabled={isProcessing}
            className="bg-purple-600 text-white px-4 py-2 rounded mr-2"
        >
            {isProcessing ? 'Running OCR...' : '🔍 Run OCR'}
        </button>
    )
}

export default RunOCRButton
