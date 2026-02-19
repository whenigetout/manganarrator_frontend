'use client'

import { useState, useEffect } from 'react'
import InputPathBreadcrumb from '../components/file_browsers/InputPathBreadcrumb'
import RunOCRButton from '../components/file_browsers/RunOCRButton'
import FolderBrowser from '../components/file_browsers/FolderBrowser'
import { OCR_STATUS, OcrStatus } from '../shared/status_enums'
import { callOCRapi } from '../server/callOCRapi'
import { useDirectoryBrowser } from './hooks/useDirectoryBrowser'
import { MediaRef, MediaNamespace } from '@manganarrator/contracts'

const WSL_BASE = process.env.NEXT_PUBLIC_WSL_BASE as string
const INPUT_ROOT = process.env.NEXT_PUBLIC_INPUT_ROOT || 'inputs'
const OUTPUT_ROOT = process.env.NEXT_PUBLIC_OUTPUT_ROOT || 'outputs'

interface OCRInputSectionClientProps {
    onSelectImage: (image: MediaRef | null) => void
}

const OCRInputSectionClient = ({
    onSelectImage
}: OCRInputSectionClientProps) => {
    const {
        browserState,
        goIntoFolder,
        goBack
    } = useDirectoryBrowser(MediaNamespace.INPUTS);

    const [ocrStatus, setOcrStatus] = useState<OcrStatus>(OCR_STATUS.IDLE);

    const triggerOcr = async () => {
        // setOcrStatus(OCR_STATUS.PROCESSING)

        // try {
        //     const formData = new FormData()
        //     formData.append(
        //         'input_path',
        //         `${WSL_BASE}/${constructFolderPath(INPUT_ROOT, ""?.path)}`
        //     )

        //     const data = await callOCRapi(formData);
        //     setOcrStatus(OCR_STATUS.DONE)
        // } catch (err) {
        //     console.error(err)
        //     setOcrStatus(OCR_STATUS.ERROR)
        // }
    }

    return (
        <section>
            <InputPathBreadcrumb
                browserState={browserState}
                canGoBack={browserState.history.length > 0}
                onBack={() => {
                    goBack();
                    onSelectImage(null);
                }}
            />

            <RunOCRButton status={ocrStatus} onRun={triggerOcr} />

            {ocrStatus === 'done' && (
                <span className="text-green-600 ml-2">✔ OCR completed</span>
            )}
            {ocrStatus === 'error' && (
                <span className="text-red-600 ml-2">✖ OCR failed</span>
            )}

            {/* folder browser ui */}
            <FolderBrowser
                folderBrowserTitle="Input Folders"
                imageBrowserTitle="Images"
                browserState={browserState}

                onEnterFolder={goIntoFolder}
                onSelectImage={onSelectImage}
            />

        </section>

    )
}

export default OCRInputSectionClient
