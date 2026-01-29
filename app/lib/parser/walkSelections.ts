import type { SelectionNode } from "./types"

export function walkSelections(
    selections: SelectionNode[] | undefined,
    cb: (node: SelectionNode, parent: SelectionNode | null, depth: number) => void,
    parent: SelectionNode | null = null,
    depth = 0
) {
    if (!selections) return

    for (const sel of selections) {
        cb(sel, parent, depth)

        if (sel.selections?.length) {
            walkSelections(sel.selections, cb, sel, depth + 1)
        }
    }
}


