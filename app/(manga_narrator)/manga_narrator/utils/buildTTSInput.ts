import { TTSInput, EmotionParams, GenderKey, MediaRef, DialogueLine, TTS_CFG } from "@manganarrator/contracts"

export const buildTTSInput = (
    dlgLine: DialogueLine,
    safeFloat: (value: unknown, fallback: number) => number,
    exg: string | number,
    cfg: string | number,
    image_ref: MediaRef,
    useCustom: boolean,
    run_id: string
): TTSInput => {

    const settings: EmotionParams = {
        exaggeration: safeFloat(exg, 1.0),
        cfg: safeFloat(cfg, 1.0),
    }

    const req: TTSInput = {
        text: dlgLine.text,
        gender: dlgLine.gender in TTS_CFG ? dlgLine.gender as GenderKey : "neutral",
        emotion: dlgLine.emotion,
        speaker: dlgLine.speaker,
        image_ref: image_ref,
        customSettings: useCustom ? settings : undefined,
        run_id: run_id,
        custom_filename: "",
        dialogue_id: dlgLine.id
    }

    return req
}

