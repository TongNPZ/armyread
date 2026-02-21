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
                    groupStr.includes("enhancement") ||
                    typeNameStr === "enhancement" ||
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
        // ✅ 2. แปลง Object abilities โดยลูปผ่านแต่ละ Category พร้อมระบบดึงจุดกระสุนให้เข้าที่
        abilities: Object.fromEntries(
            Object.entries(abilities).map(([category, rules]) => [
                category,
                (rules || []).map((rule: any) => {
                    const abilityName = rule.name ?? "Unknown Ability";
                    const originalDesc = rule.description ?? "";

                    let finalDesc = originalDesc;

                    // 🛑 กรองขยะและจัด Format เฉพาะในหมวด Leader
                    if (category === "Leader" || abilityName.toLowerCase() === "leader") {
                        finalDesc = originalDesc
                            .split('\n')
                            .map((line: string) => line.trim())
                            .filter((line: string) => {
                                if (!line) return false;
                                
                                // 🎯 ถ้าขึ้นต้นด้วย "-" และข้างหลังเป็นตัวพิมพ์ใหญ่หมด (เช่น - GENESTEALERS) ให้เตะทิ้ง!
                                if (line.startsWith('-')) {
                                    const textOnly = line.replace(/[^a-zA-Z]/g, '');
                                    if (textOnly.length > 0 && textOnly === textOnly.toUpperCase()) {
                                        return false;
                                    }
                                }
                                return true;
                            })
                            // 🎯 ดึงสัญลักษณ์ ■ หรือ • ที่โดนปัดตกบรรทัดกลับไปรวมกับชื่อยูนิต
                            .reduce((acc: string[], line: string) => {
                                if (line === '■' || line === '•') {
                                    acc.push(line);
                                } else if (acc.length > 0 && (acc[acc.length - 1] === '■' || acc[acc.length - 1] === '•')) {
                                    acc[acc.length - 1] = `${acc[acc.length - 1]} ${line}`;
                                } else {
                                    acc.push(line);
                                }
                                return acc;
                            }, [])
                            .join('<br/>'); // จัดให้อ่านง่ายๆ โดยเปลี่ยนบรรทัดใหม่เป็น tag html
                    } else {
                        // ถ้าเป็นหมวดอื่นให้ดึง Wahapedia ปกติ
                        finalDesc = getAbilityDescription(abilityName) || originalDesc;
                    }

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