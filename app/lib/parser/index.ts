import { walkSelections } from "./walkSelections"
import { parseUnitEntry } from "./parseUnitEntry"
import type { UnitEntry } from "./types"

export function parseUnitEntries(
    selections: any[]
): Record<string, UnitEntry> {
    const entries: Record<string, UnitEntry> = {}

    walkSelections(selections, (node, depth) => {
        // ❌ ไม่สร้าง UnitEntry จาก model ที่เป็น child
        if (node.type === "model" && depth > 0) return

        const entry = parseUnitEntry(node)
        if (entry) {
            entries[entry.id] = entry
        }
    })

    return entries
}