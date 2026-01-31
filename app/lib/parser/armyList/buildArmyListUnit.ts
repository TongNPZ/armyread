// app/lib/parser/armyList/buildArmyListUnit.ts
import { walkSelections } from "../roster/walkSelections"
import type { SelectionNode } from "../roster/rosterImportTypes"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "../getPoints"
import { getPrimaryCategoryFromNode } from "./getPrimaryCategory"
// ✅ Import Helper
import { getUnitStats, getWeaponStats, getAbilitiesAndKeywords } from "./armyListHelpers"

export function buildArmyListUnit(
    unitNode: SelectionNode
): ArmyListUnit | null {
    if (unitNode.type !== "unit") return null

    const modelsMap = new Map<string, ArmyListModel>()

    // ✅ 1. ดึง Stats, Abilities, Keywords ของ Unit
    const stats = getUnitStats(unitNode)
    const { abilities, keywords, factionKeywords } = getAbilitiesAndKeywords(unitNode)

    walkSelections(unitNode.selections, node => {
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

        node.selections?.forEach(child => {
            const name = child.name ?? "Unknown"

            if (name.toLowerCase().includes("warlord")) {
                model.extras.push({ name: "Warlord" })
                return
            }

            // ✅ Weapons: ใช้ Helper ดึง Profile
            if (child.type === "weapon" || child.type === "upgrade") {
                const weaponProfiles = getWeaponStats(child)
                
                if (weaponProfiles.length > 0) {
                    weaponProfiles.forEach(wp => {
                        const existing = model.weapons.find(w => w.name === wp.name)
                        if (existing) {
                            existing.count += modelCount
                        } else {
                            model.weapons.push({ ...wp, count: modelCount })
                        }
                    })
                } else if (child.type === "upgrade") {
                    const points = getPoints(child)
                    if ((points && points > 0) || !child.name?.includes("Weapon")) { 
                         model.extras.push({ name, points })
                    }
                }
            }
        })
    })

    const isWarlord = [...modelsMap.values()].some(model =>
        model.extras.some(e => e.name.toLowerCase().includes("warlord"))
    )

    return {
        id: unitNode.id ?? "",
        name: unitNode.name ?? "Unknown Unit",
        points: getPoints(unitNode),
        models: [...modelsMap.values()],
        isWarlord,
        category: getPrimaryCategoryFromNode(unitNode),
        stats,            // ✅ ส่ง Stats
        abilities,        // ✅ ส่ง Abilities
        keywords,         // ✅ ส่ง Keywords
        factionKeywords   // ✅ ส่ง Faction Keywords
    }
}