import { parseStatline } from "./parseStatline"
import type { SelectionNode } from "../roster/rosterImportTypes"
import type { Unit } from "../datasheet/armyDomainTypes"

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
