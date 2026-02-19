// ttsLineStateStore.ts
type TTSLineState = {
    cfg: number
    exg: number
    useCustom: boolean
}

const DEFAULT_CFG = 1.0
const DEFAULT_EXG = 1.0

const store = new Map<number, TTSLineState>()

export function getTTSLineState(id: number): TTSLineState {
    if (!store.has(id)) {
        store.set(id, {
            cfg: DEFAULT_CFG,
            exg: DEFAULT_EXG,
            useCustom: false,
        })
    }
    return store.get(id)!
}

export function updateTTSLineState(
    id: number,
    partial: Partial<TTSLineState>
) {
    Object.assign(getTTSLineState(id), partial)
}
