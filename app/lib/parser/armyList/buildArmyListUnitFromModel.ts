// app/lib/parser/armyList/buildArmyListUnitFromModel.ts
import { walkSelections } from "../roster/walkSelections"
import type { SelectionNode } from "../roster/rosterImportTypes"
import type { ArmyListUnit, ArmyListModel } from "./armyListTypes"
import { getPoints } from "../getPoints"
import { getPrimaryCategoryFromNode } from "./getPrimaryCategory"
import { getUnitStats, getWeaponStats, getAbilitiesAndKeywords } from "./armyListHelpers"

// ✅ 1. Import ฟังก์ชันค้นหาจาก Wahapedia
import { getAbilityDescription } from "../../wahapedia/lookup"

export function buildArmyListUnitFromModel(
    modelNode: SelectionNode
): ArmyListUnit | null {
    const modelsMap = new Map<string, ArmyListModel>()
    const stats = getUnitStats(modelNode)
    const { abilities, keywords, factionKeywords } = getAbilitiesAndKeywords(modelNode)

    let unitIsWarlord = false;

    const checkIsWarlord = (node: SelectionNode) => {
        if (node.name?.toLowerCase().includes("warlord")) return true;
        if (node.categories?.some(c => c.name === "Warlord")) return true;
        return false;
    };

    if (checkIsWarlord(modelNode)) unitIsWarlord = true;

    const modelName = modelNode.name ?? "Unknown Model"
    const modelCount = modelNode.number ?? 1

    const model: ArmyListModel = {
        name: modelName,
        count: modelCount,
        weapons: [],
        wargear: [],
        enhancements: []
    }

    modelsMap.set(modelName, model)

    if (modelNode.selections) {
        walkSelections(modelNode.selections, child => {
            const name = child.name ?? "Unknown"

            if (checkIsWarlord(child)) unitIsWarlord = true;

            const countToAdd = (child.number && child.number > 0) ? child.number : modelCount;

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

            if (child.type === "upgrade") {
                const points = getPoints(child)

                // --- Structural Filter Start ---
                const childAny = child as any;

                // ดึงค่าจากโครงสร้าง JSON
                const groupStr = (childAny.group && typeof childAny.group === 'string')
                    ? childAny.group.toLowerCase()
                    : "";

                const typeNameStr = (childAny.typeName && typeof childAny.typeName === 'string')
                    ? childAny.typeName.toLowerCase()
                    : "";

                const isEnhancement =
                    // เช็คคำว่า enhancement ใน group (รองรับ Enhancements::...)
                    groupStr.includes("enhancement") ||
                    // เช็ค typeName
                    typeNameStr === "enhancement" ||
                    // เช็ค categories
                    child.categories?.some(c => c.name?.toLowerCase().includes("enhancement"));
                // --- Structural Filter End ---

                if (isEnhancement) {
                    model.enhancements.push({ name, points })
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
    }

    return {
        id: modelNode.id ?? "",
        name: modelNode.name ?? "Unknown Unit",
        points: getPoints(modelNode),
        models: [...modelsMap.values()],
        isWarlord: unitIsWarlord,
        category: getPrimaryCategoryFromNode(modelNode),
        stats,
        // ✅ 2. แปลง Object abilities โดยลูปผ่านแต่ละ Category เพื่อดึง Description จาก Wahapedia
        abilities: Object.fromEntries(
            Object.entries(abilities).map(([category, rules]) => [
                category,
                (rules || []).map((rule: any) => {
                    const abilityName = rule.name ?? "Unknown Ability";
                    const originalDesc = rule.description ?? "";

                    // 🌟 ทริค: ถ้าหมวดหมู่คือ "Leader" (กล่องล่างสุด) ให้ใช้รายชื่อ Unit ดั้งเดิม
                    // แต่ถ้าเป็นกล่องอื่น (เช่น Core, Faction) ให้ดึงกฎ Leader จาก Wahapedia
                    const isLeaderCategory = category === "Leader";
                    const finalDesc = isLeaderCategory 
                        ? originalDesc 
                        : (getAbilityDescription(abilityName) || originalDesc);

                    return {
                        ...rule,
                        name: abilityName,
                        description: finalDesc
                    };
                }) as any[]
            ])
        ),
        keywords,
        factionKeywords
    }
}