import type { SelectionNode } from "./types"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "./getPoints"

export function buildArmyListUnitFromModel(
    modelNode: SelectionNode
): ArmyListUnit | null {
    if (modelNode.type !== "model") return null

    const modelName = modelNode.name ?? "Unknown Model"
    const modelCount = modelNode.number ?? 1

    const model: ArmyListModel = {
        name: modelName,
        count: modelCount,
        weapons: [],
        extras: []
    }

    modelNode.selections?.forEach(child => {
        if (child.type !== "upgrade" && child.type !== "weapon") return

        const name = child.name ?? "Unknown"
        const points = getPoints(child)

        // ✅ Warlord (ไม่มี pts แต่ต้องเป็น extra)
        if (name.toLowerCase().includes("warlord")) {
            model.extras.push({ name })
            return
        }

        // ✅ Enhancement (มี pts)
        if (points && points > 0) {
            model.extras.push({ name, points })
            return
        }

        // ✅ Weapon / wargear
        model.weapons.push({
            name,
            count: modelCount
        })
    })

    const isWarlord = model.extras.some(e =>
        e.name?.toLowerCase().includes("warlord")
    )

    return {
        id: modelNode.id ?? modelName,
        name: modelName,
        points: getPoints(modelNode),
        models: [model],
        isWarlord
    }
}
