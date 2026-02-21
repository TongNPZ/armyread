// app/lib/parser/armyList/buildArmyListUnit.ts
import { walkSelections } from "../roster/walkSelections"
import type { SelectionNode } from "../roster/rosterImportTypes"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "../getPoints"
import { getPrimaryCategoryFromNode } from "./getPrimaryCategory"
import { getUnitStats, getWeaponStats, getAbilitiesAndKeywords } from "./armyListHelpers"
import { getAbilityDescription } from "../../wahapedia/lookup"

export function buildArmyListUnit(
    unitNode: SelectionNode
): ArmyListUnit | null {
    if (unitNode.type !== "unit") return null

    const modelsMap = new Map<string, ArmyListModel>()
    const stats = getUnitStats(unitNode)
    const { abilities, keywords, factionKeywords } = getAbilitiesAndKeywords(unitNode)

    let unitIsWarlord = false;

    const checkIsWarlord = (node: SelectionNode) => {
        if (node.name?.toLowerCase().includes("warlord")) return true;
        if (node.categories?.some(c => c.name === "Warlord")) return true;
        return false;
    };

    if (checkIsWarlord(unitNode)) unitIsWarlord = true;

    walkSelections(unitNode.selections, node => {
        if (checkIsWarlord(node)) unitIsWarlord = true;
        if (node.type !== "model") return

        const modelName = node.name ?? "Unknown Model"
        const modelCount = node.number ?? 1

        if (!modelsMap.has(modelName)) {
            modelsMap.set(modelName, {
                name: modelName,
                count: 0,
                weapons: [],
                wargear: [],
                enhancements: []
            })
        }

        const model = modelsMap.get(modelName)!
        model.count += modelCount

        node.selections?.forEach(child => {
            const name = child.name ?? "Unknown"
            if (checkIsWarlord(child)) unitIsWarlord = true;

            const countToAdd = (child.number && child.number > 0) ? child.number : modelCount;

            // 1. Weapon Stats
            const weaponGroups = getWeaponStats(child)
            if (weaponGroups.length > 0) {
                weaponGroups.forEach(wg => {
                    const existing = model.weapons.find(w => w.name === wg.name)
                    if (existing) {
                        existing.count += countToAdd
                    } else {
                        model.weapons.push({ ...wg, count: countToAdd })
                    }
                })
                return;
            }

            // 2. Upgrades (Structural Check Logic)
            if (child.type === "upgrade") {
                const points = getPoints(child)
                const childAny = child as any;
                const groupStr = (childAny.group && typeof childAny.group === 'string')
                    ? childAny.group.toLowerCase() : "";
                const typeNameStr = (childAny.typeName && typeof childAny.typeName === 'string')
                    ? childAny.typeName.toLowerCase() : "";

                const isEnhancement =
                    groupStr.includes("enhancement") ||
                    typeNameStr === "enhancement" ||
                    child.categories?.some(c => c.name?.toLowerCase().includes("enhancement"));

                if (isEnhancement) {
                    // ✅ ค้นหา Description ของ Enhancement และเก็บลงไปในโมเดลด้วย
                    const enhancementDesc = getAbilityDescription(name);
                    model.enhancements.push({ 
                        name, 
                        points, 
                        description: enhancementDesc || undefined 
                    })
                } else {
                    if (!checkIsWarlord(child)) {
                        const existingWargear = model.wargear.find(w => w.name === name)
                        if (existingWargear) {
                            existingWargear.count += countToAdd
                        } else {
                            model.wargear.push({ name, count: countToAdd })
                        }
                    }
                }
            }
        })
    })

    return {
        id: unitNode.id ?? "",
        name: unitNode.name ?? "Unknown Unit",
        points: getPoints(unitNode),
        models: [...modelsMap.values()],
        isWarlord: unitIsWarlord,
        category: getPrimaryCategoryFromNode(unitNode),
        stats,
        abilities: Object.fromEntries(
            Object.entries(abilities).map(([category, rules]) => [
                category,
                rules.map(rule => {
                    const ruleName = rule.name ?? "Unknown Rule";
                    const originalDesc = rule.description ?? "";

                    const finalDesc = category === "Leader"
                        ? originalDesc
                        : (getAbilityDescription(ruleName) || originalDesc);

                    return {
                        ...rule,
                        description: finalDesc
                    };
                })
            ])
        ),
        keywords,
        factionKeywords
    }
}