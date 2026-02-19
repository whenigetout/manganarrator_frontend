import { TTS_CFG, GenderKey } from "@manganarrator/contracts"

export type DropdownOption = {
    value: string
    label: string
    isUnknown?: boolean
}


export function buildOptionsWithUnknown(
    knownValues: string[],
    ocrValue?: string,
    unknownPrefix = "unknown"
): {
    options: DropdownOption[]
    selected: string
} {
    // Known options
    const options: DropdownOption[] = knownValues.map(v => ({
        value: v,
        label: v,
    }))

    // If OCR value is missing or already known
    if (!ocrValue || knownValues.includes(ocrValue)) {
        return {
            options,
            selected: ocrValue ?? knownValues[0],
        }
    }

    // Inject unknown option
    const unknownValue = `${unknownPrefix}_${ocrValue}`

    return {
        options: [
            {
                value: unknownValue,
                label: `⚠ unknown: ${ocrValue}`,
                isUnknown: true,
            },
            ...options,
        ],
        selected: unknownValue,
    }
}

export function getGenderDropdown(
    ocrGender?: string
): {
    options: DropdownOption[]
    selected: string
} {
    const knownGenders = Object.keys(TTS_CFG)

    return buildOptionsWithUnknown(
        knownGenders,
        ocrGender,
        "unknown_gender"
    )
}

export function getSpeakerDropdown(
    selectedGender: string,
    ocrSpeaker?: string
): {
    options: DropdownOption[]
    selected: string
} {
    const gender: GenderKey =
        selectedGender in TTS_CFG
            ? (selectedGender as GenderKey)
            : "neutral"

    const knownSpeakers = Object.keys(TTS_CFG[gender])

    return buildOptionsWithUnknown(
        knownSpeakers,
        ocrSpeaker,
        "unknown_speaker"
    )
}

export function getEmotionDropdown(
    selectedGender: string,
    selectedSpeaker: string,
    ocrEmotion?: string
): {
    options: DropdownOption[]
    selected: string
} {
    const gender: GenderKey =
        selectedGender in TTS_CFG
            ? (selectedGender as GenderKey)
            : "neutral"

    const genderCfg = TTS_CFG[gender]

    const speakerCfg =
        selectedSpeaker in genderCfg
            ? (genderCfg as any)[selectedSpeaker]
            : (genderCfg as any)["neutral"]

    const knownEmotions = Object.keys(speakerCfg.emotions)

    return buildOptionsWithUnknown(
        knownEmotions,
        ocrEmotion,
        "unknown_emotion"
    )
}
