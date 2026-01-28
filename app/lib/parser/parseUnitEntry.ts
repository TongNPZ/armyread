import type {
    SelectionNode,
    UnitEntry,
    ModelEntry,
} from "./types"

function parseModels(
    node: SelectionNode
): ModelEntry[] {
    if (!node.selections) return []

    return node.selections
        .filter(s => s.type === "model")
        .map(s => ({
            id: s.id!,
            name: s.name!,
            count: s.number ?? 1,
        }))
}

function hasPoints(node: SelectionNode): boolean {
    return !!node.costs?.some(c => c.name === "pts")
}

function hasStatline(node: SelectionNode): boolean {
    return !!node.profiles?.some(
        p => p.characteristics?.length === 6
    )
}
export function parseUnitEntry(
    node: SelectionNode
): UnitEntry | null {
    if (!node.id || !node.name) return null

    const models = parseModels(node)

    // ❌ ไม่ใช่ unit ถ้าไม่มี model ใด ๆ เลย
    if (models.length === 0 && node.type !== "model") {
        return null
    }

    // character / vehicle (model เดียว)
    if (models.length === 0 && node.type === "model") {
        models.push({
            id: node.id,
            name: node.name,
            count: node.number ?? 1,
        })
    }

    const totalModels = models.reduce(
        (sum, m) => sum + m.count,
        0
    )

    const pointsCost = node.costs?.find(c => c.name === "pts")

    return {
        id: node.id,
        name: node.name,
        points: pointsCost?.value,
        models,
        totalModels,
        rawNode: node,
    }
}
