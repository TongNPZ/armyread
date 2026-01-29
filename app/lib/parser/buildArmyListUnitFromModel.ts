import type { SelectionNode } from "./types"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"

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

    // อ่านของใต้ model
    modelNode.selections?.forEach(child => {
        if (child.type === "upgrade" || child.type === "weapon") {
            const name = child.name ?? "Unknown"

            // costs เป็น array → หา points
            const points = child.costs?.find(
                c => c.name === "pts" || c.name === "points"
            )?.value

            if (points && points > 0) {
                model.extras.push({ name, points })
            } else {
                model.weapons.push({
                    name,
                    count: modelCount
                })
            }
        }
    })

    return {
        id: modelNode.id ?? modelName,
        name: modelName,
        points:
            modelNode.costs?.find(
                c => c.name === "pts" || c.name === "points"
            )?.value ?? 0,
        models: [model]
    }
}
