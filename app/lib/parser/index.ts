import { walkSelections } from "./walkSelections"
import { parseUnitEntry } from "./parseUnitEntry"
import type { UnitEntry } from "./types"

export function parseUnitEntries(
    selections: any[]
): Record<string, UnitEntry> {
    const entries: Record<string, UnitEntry> = {}

    walkSelections(selections, (node, parent, depth) => {
        if (node.type === "model" && parent?.type === "unit") return

        const entry = parseUnitEntry(node)
        if (entry) {
            entries[entry.id] = entry
        }
    })


    return entries
}

