// lib/parser/walkSelections.ts

type SelectionNode = {
    id?: string
    name?: string
    type?: string
    selections?: SelectionNode[]
    profiles?: unknown[]
    categories?: unknown[]
    rules?: unknown[]
    costs?: unknown[]
}

/**
 * Recursively walk through New Recruit selections tree
 */
export function walkSelections(
    selections: SelectionNode[] | undefined,
    onNode: (node: SelectionNode, depth: number) => void,
    depth = 0
) {
    if (!selections || selections.length === 0) return

    for (const node of selections) {
        onNode(node, depth)

        if (Array.isArray(node.selections)) {
            walkSelections(node.selections, onNode, depth + 1)
        }
    }
}
