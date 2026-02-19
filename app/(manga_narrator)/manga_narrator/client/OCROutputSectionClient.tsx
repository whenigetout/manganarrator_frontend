import { useDirectoryBrowser } from "./hooks/useDirectoryBrowser"
import InputPathBreadcrumb from "../components/file_browsers/InputPathBreadcrumb"
import FolderBrowser from "../components/file_browsers/FolderBrowser"
import { BrowserState } from "../types/BrowserState"
import { MediaRef, MediaNamespace } from "@manganarrator/contracts"

interface OCROutputSectionClientProps {
    onSelectJson: (json_file: MediaRef | null) => void
}
const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API as string
const INPUT_ROOT = process.env.NEXT_PUBLIC_INPUT_ROOT || 'inputs'
const OUTPUT_ROOT = process.env.NEXT_PUBLIC_OUTPUT_ROOT || 'outputs'

export const OCROutputSectionClient = ({
    onSelectJson
}: OCROutputSectionClientProps) => {

    const {
        browserState,
        goIntoFolder,
        goBack
    } = useDirectoryBrowser(MediaNamespace.OUTPUTS);

    return (
        <section>
            <InputPathBreadcrumb
                browserState={browserState}
                canGoBack={browserState.history.length > 0}
                onBack={() => {
                    goBack();
                    onSelectJson(null);
                }}
            />

            {/* folder browser ui */}
            <FolderBrowser
                folderBrowserTitle="Output Folder"
                imageBrowserTitle="JSON Files"
                browserState={browserState}

                onEnterFolder={goIntoFolder}
                onSelectImage={onSelectJson}
            />

        </section>
    )
}
