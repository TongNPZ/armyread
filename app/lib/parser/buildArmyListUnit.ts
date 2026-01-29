import { walkSelections } from "./walkSelections"
import type { SelectionNode } from "./types"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "./getPoints"

export function buildArmyListUnit(
    unitNode: SelectionNode
): ArmyListUnit | null {
    if (unitNode.type !== "unit") return null

    const modelsMap = new Map<string, ArmyListModel>()

    walkSelections(unitNode.selections, (node) => {
        if (node.type !== "model") return

        const modelName = node.name ?? "Unknown Model"
        const modelCount = node.number ?? 1

        if (!modelsMap.has(modelName)) {
            modelsMap.set(modelName, {
                name: modelName,
                count: 0,
                weapons: [],
                extras: []
            })
        }

        const model = modelsMap.get(modelName)!
        model.count += modelCount

        // อ่านของที่อยู่ใต้ model
        node.selections?.forEach((child) => {
            // weapon / wargear ส่วนใหญ่จะอยู่ตรงนี้
            if (child.type === "upgrade" || child.type === "weapon") {
                const name = child.name ?? "Unknown"

                // enhancement / wargear ที่มีแต้ม
                const points = getPoints(child)

                if (points && points > 0) {
                    model.extras.push({ name, points })
                } else {
                    const existing = model.weapons.find(w => w.name === name)
                    if (existing) {
                        existing.count += modelCount
                    } else {
                        model.weapons.push({
                            name,
                            count: modelCount
                        })
                    }
                }
            }
        })
    })

    return {
        id: unitNode.id ?? "",
        name: unitNode.name ?? "Unknown Unit",
        points: getPoints(unitNode),
        models: [...modelsMap.values()]
    }

}
