'use client'

import { useState } from 'react'
import OCRInputSectionClient from './client/OCRInputSectionClient'
import { OCROutputSectionClient } from './client/OCROutputSectionClient'
import { NarrationWorkbenchClient } from './client/NarrationWorkbenchClient'
import { TestPageLink } from './dev/components/TestPageLink'
import { useOcrJson } from './client/hooks/useOcrJson'
import { MediaRef } from '@manganarrator/contracts'
import { fileNameFromMediaRef, resolveMediaRef } from './utils/helpers'

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
                    onSelectOcrJson={setSelectedOcrJson}
                />

                {loading && <p className="mt-3 text-sm text-zinc-600">Loading OCR JSON...</p>}
                {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

                <OCROutputSectionClient
                    onSelectJson={setSelectedOcrJson}
                />
            </div>

            {ocrJsonData && ocrJsonData.images[0]?.dialogue_lines[0] && (
                <p>TEXT: {ocrJsonData.images[0].dialogue_lines[0].text}</p>
            )}

            <div className="p-6">
                {ocrJsonData && <NarrationWorkbenchClient
                    ocrJsonData={ocrJsonData}
                    dispatchEdit={dispatchEdit}
                    saveJson={saveJson}
                    savePreview={savePreview}
                />}
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