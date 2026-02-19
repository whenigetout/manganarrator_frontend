import { MediaRef } from "../../types/manga_narrator_django_api_types"
import { BrowserState } from "../../types/BrowserState"

interface InputPathBreadcrumbProps {
    browserState: BrowserState
    canGoBack: boolean
    onBack: () => void
}

const InputPathBreadcrumb = ({
    browserState,
    canGoBack,
    onBack
}: InputPathBreadcrumbProps) => {
    // Clear selected image/file if the callback is passed down

    return (
        <div className="mb-3">
            <p className="text-sm text-gray-400">
                📂 Current folder: <code>{browserState.currentDir.path}</code>
            </p>

            {canGoBack && (
                <button
                    onClick={onBack}
                    className="text-blue-600 underline mt-1"
                >
                    ← Back
                </button>
            )}
        </div>
    )
}

export default InputPathBreadcrumb
