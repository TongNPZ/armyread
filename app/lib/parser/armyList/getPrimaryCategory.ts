import type { SelectionNode } from "../roster/rosterImportTypes"

export function getPrimaryCategoryFromNode(
    node: SelectionNode
): string {
    const primary = node.categories?.find(
        c => c.primary === true
    )

    return primary?.name?.toUpperCase()
        ?? "OTHER DATASHEETS"
}