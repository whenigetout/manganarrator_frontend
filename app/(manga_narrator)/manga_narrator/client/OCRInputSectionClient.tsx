'use client'

import { useState } from 'react'
import InputPathBreadcrumb from '../components/file_browsers/InputPathBreadcrumb'
import RunOCRButton from '../components/file_browsers/RunOCRButton'
import FolderBrowser from '../components/file_browsers/FolderBrowser'
import { OCR_STATUS, OcrStatus } from '../shared/status_enums'
import { callOCRapi } from '../server/callOCRapi'
import { useDirectoryBrowser } from './hooks/useDirectoryBrowser'
import { MediaRef, MediaNamespace } from '@manganarrator/contracts'

interface OCRInputSectionClientProps {
    onSelectImage: (image: MediaRef | null) => void
    onSelectOcrJson: (jsonFile: MediaRef | null) => void
}

const OCRInputSectionClient = ({
    onSelectImage,
    onSelectOcrJson,
}: OCRInputSectionClientProps) => {
    const {
        browserState,
        goIntoFolder,
        goBack
    } = useDirectoryBrowser(MediaNamespace.INPUTS);

    const [ocrStatus, setOcrStatus] = useState<OcrStatus>(OCR_STATUS.IDLE);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    const triggerOcr = async () => {
        if (!browserState.currentDir.path) {
            setStatusMessage("Open the chapter folder you want to OCR first.");
            return;
        }

        setOcrStatus(OCR_STATUS.PROCESSING);
        setStatusMessage("Running OCR for the selected folder...");

        try {
            const data = await callOCRapi(browserState.currentDir, {
                attach_bboxes: true,
                annotate_bboxes: false,
            });

            if (!data.ocr_json_file) {
                throw new Error("OCR finished but did not return an OCR JSON file.");
            }

            onSelectOcrJson(data.ocr_json_file);
            setOcrStatus(OCR_STATUS.DONE);
            setStatusMessage(`OCR completed: ${data.count ?? 0} image(s).`);
        } catch (err) {
            console.error(err);
            setOcrStatus(OCR_STATUS.ERROR);
            setStatusMessage(err instanceof Error ? err.message : "OCR failed.");
        }
    }

    return (
        <section>
            <InputPathBreadcrumb
                browserState={browserState}
                canGoBack={browserState.history.length > 0}
                onBack={() => {
                    goBack();
                    onSelectImage(null);
                    onSelectOcrJson(null);
                    setOcrStatus(OCR_STATUS.IDLE);
                    setStatusMessage(null);
                }}
            />

            <div className="mb-3 flex flex-wrap items-center gap-2">
                <RunOCRButton
                    status={ocrStatus}
                    onRun={triggerOcr}
                    disabled={!browserState.currentDir.path}
                />
                {statusMessage && (
                    <span className={ocrStatus === OCR_STATUS.ERROR ? "text-sm text-red-600" : "text-sm text-zinc-600"}>
                        {statusMessage}
                    </span>
                )}
            </div>

            <FolderBrowser
                folderBrowserTitle="Input Folders"
                imageBrowserTitle="Images"
                browserState={browserState}
                onEnterFolder={(folder) => {
                    goIntoFolder(folder);
                    onSelectImage(null);
                    onSelectOcrJson(null);
                    setOcrStatus(OCR_STATUS.IDLE);
                    setStatusMessage(null);
                }}
                onSelectImage={onSelectImage}
            />

        </section>

    )
}

export default OCRInputSectionClient