import { OcrJsonResult } from "../components/narrationWorkBench/OcrJsonResult"
import { OCRRun } from "@manganarrator/contracts"
import { EditAction } from "../types/EditActionType"

interface NarrationWorkbenchClientProps {
    ocrJsonData: OCRRun
    dispatchEdit: (action: EditAction) => void
    saveJson: () => void
    savePreview: () => Promise<void>
}

export const NarrationWorkbenchClient = ({
    ocrJsonData,
    dispatchEdit,
    saveJson,
    savePreview
}: NarrationWorkbenchClientProps) => {

    return (
        <div className="mt-12 border-t pt-6">
            <OcrJsonResult
                jsonResponse={ocrJsonData}
                dispatchEdit={dispatchEdit}
                saveJson={saveJson}
                savePreview={savePreview}
            />
        </div>
    )
}
