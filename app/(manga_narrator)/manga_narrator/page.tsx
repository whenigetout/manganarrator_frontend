'use client'

import { useState } from 'react'
import OCRInputSectionClient from './client/OCRInputSectionClient'
import { OCROutputSectionClient } from './client/OCROutputSectionClient'
import { NarrationWorkbenchClient } from './client/NarrationWorkbenchClient'
import { TestPageLink } from './dev/components/TestPageLink'
import { useOcrJson } from './client/hooks/useOcrJson'
import { MediaRef } from '@manganarrator/contracts'
import { fileNameFromMediaRef, resolveMediaRef } from './utils/helpers'
// import { Emotion } from './types/tts_api_types'

// === Path Constants ===
const MEDIA_ROOT = process.env.NEXT_PUBLIC_MEDIA_ROOT as string

export default function MangaNarratorPage() {
    const [selectedImage, setSelectedImage] = useState<MediaRef | null>(null)
    const [selectedOcrJson, setSelectedOcrJson] = useState<MediaRef | null>(null)

    const {
        data: ocrJsonData,
        dispatchEdit,
        saveJson,
        savePreview,
        loading,
        error
    } = useOcrJson(selectedOcrJson)

    return (
        <div>


            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-4">📚 Manga Narrator: Load Chapter</h1>
                <TestPageLink />

                <OCRInputSectionClient
                    onSelectImage={setSelectedImage}
                />
                <OCROutputSectionClient
                    onSelectJson={setSelectedOcrJson}
                />
            </div>

            {ocrJsonData &&
                <p>TEXT: {ocrJsonData.images[0].dialogue_lines[0].text}</p>}

            <div className="p-6">
                {ocrJsonData && <NarrationWorkbenchClient
                    ocrJsonData={ocrJsonData}
                    dispatchEdit={dispatchEdit}
                    saveJson={saveJson}
                    savePreview={savePreview}
                />}
                {/*
                <VideoPreviewClient
                /> */}
                {selectedImage && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold">
                            📷 Preview: {fileNameFromMediaRef(selectedImage)}
                        </h2>
                        <img
                            src={resolveMediaRef(selectedImage)}
                            alt="preview"
                            className="max-w-full border mt-2"
                            onError={(e) => {
                                e.currentTarget.style.display = "none"
                            }}
                        />
                    </div>
                )}
            </div>

        </div>
    )
}
