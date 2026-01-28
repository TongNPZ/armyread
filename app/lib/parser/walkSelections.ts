import type { SelectionNode } from "./types"

export function walkSelections(
    selections: SelectionNode[] | undefined,
    cb: (node: SelectionNode, depth: number) => void,
    depth = 0
) {
    if (!selections) return

    for (const sel of selections) {
        cb(sel, depth)

        if (sel.selections?.length) {
            walkSelections(sel.selections, cb, depth + 1)
        }
    }
}
