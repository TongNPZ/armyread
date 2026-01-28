import { parseStatline } from "./parseStatline"
import type { Unit, SelectionNode } from "./types"

export function parseUnitBasic(
    node: SelectionNode
): Unit | null {
    if (node.type !== "model") return null
    if (!node.id || !node.name) return null

    const pointsCost = node.costs?.find(c => c.name === "pts")
    console.log(node.name, node.profiles)
    return {
        id: node.id,
        name: node.name,
        count: node.number ?? 1,
        points: pointsCost?.value,
        keywords: (node.categories ?? [])
            .map(c => c.name)
            .filter((k): k is string => Boolean(k)),

        stats: parseStatline(node.profiles),

        abilities: [],
        weapons: [],

        rawProfiles: node.profiles,
    }
}
