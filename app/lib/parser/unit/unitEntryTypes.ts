// app/lib/parser/unit/unitEntryTypes.ts
import type { SelectionNode } from "../roster/rosterImportTypes"

export type ModelEntry = {
    id: string
    name: string
    count: number
}

export type UnitEntry = {
    id: string
    name: string
    points?: number
    models: ModelEntry[]
    totalModels: number
    rawNode: SelectionNode
}
