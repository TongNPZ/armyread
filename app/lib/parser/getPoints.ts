// app/lib/parser/getPoints.ts
import type { SelectionNode } from "./roster/rosterImportTypes"

export function getPoints(node: SelectionNode): number {
    if (!node.costs) return 0

    const pts = node.costs.find(
        c => c.name === "pts" || c.name === "Points"
    )

    return pts?.value ?? 0
}
