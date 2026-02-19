import { useEffect, useState } from 'react'
import { MediaRef, MediaNamespace, MangaDirViewResponse } from '@manganarrator/contracts'
import { BrowserState } from '../../types/BrowserState'
import { fetchDir } from '../../server/fetchDir'

export function useDirectoryBrowser(
    namespace: MediaNamespace
) {
    // default mediaRef obj, make strictly immutable
    const default_mediaRef: MediaRef = Object.freeze({
        namespace: namespace,
        path: ""
    })

    const [browserState, setBrowserState] = useState<BrowserState>({
        currentDir: {
            namespace: namespace,
            path: ""
        },
        currentDirContents: null,
        history: [],
        loading: false,
        error: null
    })

    function goIntoFolder(folder: MediaRef) {
        setBrowserState(prev => ({
            ...prev,
            currentDir: folder,
            history: [...(prev.history ?? []), folder]
        }))
    }

    function goBack() {
        setBrowserState(prev => {
            const history = prev.history ?? [];

            if (history.length === 0) return prev;

            const newHistory = history.slice(0, -1);
            const newCurrentDir =
                newHistory.at(-1) ?? default_mediaRef;

            return {
                ...prev,
                currentDir: newCurrentDir,
                history: newHistory,
            };
        });
    }

    useEffect(() => {
        setBrowserState(prev => ({
            ...prev,
            loading: true,
            error: null
        }))

        const mediaRef: MediaRef = browserState.currentDir.path ? browserState.currentDir : default_mediaRef

        fetchDir(mediaRef)
            .then((data: MangaDirViewResponse) => {
                setBrowserState(prev => ({
                    ...prev,
                    currentDirContents: data,
                    loading: false
                }))
            })
            .catch(err => {
                console.error(err)
                setBrowserState(prev => ({
                    ...prev,
                    currentDirContents: null,
                    loading: false,
                    error: "Failed to load directory"
                }))
            })
    }, [browserState.currentDir])

    return {
        browserState,
        goIntoFolder,
        goBack
    }
}
