import type { SelectionNode } from "./types"

export function getPoints(node: SelectionNode): number {
    if (!node.costs) return 0

    const pts = node.costs.find(
        c => c.name === "pts" || c.name === "Points"
    )

    return pts?.value ?? 0
}
