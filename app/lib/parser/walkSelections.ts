import type { SelectionNode } from "./types"

export function walkSelections(
    selections: SelectionNode[],
    cb: (node: SelectionNode) => void
) {
    for (const sel of selections) {
        cb(sel)

        if (sel.selections?.length) {
            walkSelections(sel.selections, cb)
        }
    }
}
