// app/lib/parser/index.ts
import { walkSelections } from "./walkSelections"
import { parseUnitBasic } from "./parseUnit"
import type { Unit } from "./types"

export function parseUnits(
    selections: any[]
): Record<string, Unit> {
    const units: Record<string, Unit> = {}

    walkSelections(selections, (node) => {
        const unit = parseUnitBasic(node)
        if (unit) {
            units[unit.id] = unit
        }
    })

    return units
}
