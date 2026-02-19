// useTTSEngine.ts
import { fetchTTSResult } from "../../server/fetchTTSResult"
import { TTSInput, TTSOutput } from "@manganarrator/contracts"

export function useTTSEngine() {
    const generateOne = async (input: TTSInput) => {
        return fetchTTSResult(input)
    }

    const generateMany = async (
        inputs: TTSInput[]
    ): Promise<TTSOutput[]> => {
        const results: TTSOutput[] = []
        for (const input of inputs) {
            results.push(await fetchTTSResult(input))
        }
        return results
    }

    return { generateOne, generateMany }
}
