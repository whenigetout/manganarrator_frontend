import { MediaRef, MangaDirViewResponse } from "@manganarrator/contracts"

export type BrowserState = {
    currentDir: MediaRef
    currentDirContents: MangaDirViewResponse | null
    history: MediaRef[]
    loading: boolean
    error: string | null
}
