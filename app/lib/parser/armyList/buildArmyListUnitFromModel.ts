// app/lib/parser/armyList/buildArmyListUnitFromModel.ts
import type { SelectionNode } from "../roster/rosterImportTypes"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "../getPoints"
import { getPrimaryCategoryFromNode } from "./getPrimaryCategory"

export function buildArmyListUnitFromModel(
    modelNode: SelectionNode
): ArmyListUnit | null {
    if (modelNode.type !== "model") return null
    if (!modelNode.name) return null

    const modelName = modelNode.name
    const modelCount = modelNode.number ?? 1

    const model: ArmyListModel = {
        name: modelName,
        count: modelCount,
        weapons: [],
        extras: [],
    }

    modelNode.selections?.forEach(child => {
        if (child.type !== "upgrade" && child.type !== "weapon") return
        if (!child.name) return

        const name = child.name
        const points = getPoints(child)

        /* ===== WARLORD ===== */
        if (name.toLowerCase().includes("warlord")) {
            model.extras.push({ name: "Warlord" })
            return
        }

        /* ===== ENHANCEMENT ===== */
        if (points && points > 0) {
            model.extras.push({ name, points })
            return
        }

        /* ===== WEAPON / WARGEAR ===== */
        model.weapons.push({
            name,
            count: modelCount,
        })
    })

    const isWarlord = model.extras.some(e =>
        e.name.toLowerCase().includes("warlord")
    )

    return {
        id: modelNode.id ?? modelName,
        name: modelName,
        points: getPoints(modelNode),
        category: getPrimaryCategoryFromNode(modelNode),
        models: [model],
        isWarlord,
    }
}
