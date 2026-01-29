// app/lib/parser/parseUnitEntry.ts
import type { SelectionNode } from "./rosterImportTypes"
import type {
    UnitEntry,
    ModelEntry,
} from "../unit/unitEntryTypes"
// type guard
function isModelNode(
    s: SelectionNode
): s is SelectionNode & { id: string; name: string } {
    return s.type === "model" && !!s.id && !!s.name
}
/* ===== MODEL PARSER ===== */
function parseModels(
    node: SelectionNode
): ModelEntry[] {
    if (!node.selections) return []

    return node.selections
        .filter(isModelNode)
        .map(s => ({
            id: s.id,
            name: s.name,
            count: s.number ?? 1,
        }))
}

/* ===== UNIT PARSER ===== */
export function parseUnitEntry(
    node: SelectionNode
): UnitEntry | null {
    const { id, name, type } = node
    if (!id || !name) return null

    const models = parseModels(node)

    /* ===== NON-UNIT GUARD ===== */
    // ไม่ใช่ model และไม่มี model ลูก → ไม่ใช่ unit
    if (models.length === 0 && type !== "model") {
        return null
    }

    /* ===== SINGLE MODEL UNIT ===== */
    // character / vehicle (ตัวเดียว)
    if (models.length === 0 && type === "model") {
        models.push({
            id,
            name,
            count: node.number ?? 1,
        })
    }

    const totalModels = models.reduce(
        (sum, m) => sum + m.count,
        0
    )

    const points =
        node.costs?.find(c => c.name === "pts")?.value

    return {
        id,
        name,
        points,
        models,
        totalModels,
        rawNode: node,
    }
}
