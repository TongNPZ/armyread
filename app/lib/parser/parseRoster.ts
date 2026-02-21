// app/lib/parser/parseRoster.ts
import { walkSelections } from "./roster/walkSelections"
import { buildArmyListUnit } from "./armyList/buildArmyListUnit"
import { buildArmyListUnitFromModel } from "./armyList/buildArmyListUnitFromModel"
import type { ArmyListUnit } from "./armyList/armyListTypes"
import type {
    RosterType,
    SelectionNode,
    Force,
    ArmyRule,
} from "./roster/rosterImportTypes"
import { normalizeArmyRules, type ArmyRuleWithReferences } from "./armyList/normalizeArmyRules"

// ✅ Import ฟังก์ชัน Reverse Lookup 
import { getAbilityDescription, getWahapediaDetachmentRules, findWahapediaRuleByText } from "../wahapedia/lookup"

export type ParsedRoster = {
    meta: {
        name?: string
        faction?: string
        points: {
            used?: number
            limit?: number
        }
    }
    armyRules: ArmyRuleWithReferences[]
    detachment?: {
        id: string
        name?: string
        rules?: ArmyRule[]
    }
    units: ArmyListUnit[]
}

export function parseRoster(data: RosterType): ParsedRoster | null {
    const roster = data.roster
    if (!roster) return null

    const force = roster.forces?.[0] as Force | undefined
    if (!force) return null

    const selections = (force.selections ?? []) as SelectionNode[]

    const used = roster.costs?.find(c => c.name === "pts")?.value
    const limit = roster.costLimits?.find(c => c.name === "pts")?.value

    const detachmentNode = selections.find(s => s.name === "Detachment" || s.categories?.some(c => c.name === "Detachment"))
    const detachment = detachmentNode?.selections?.[0]

    const armyRules = normalizeArmyRules(force)
    const units: ArmyListUnit[] = []

    walkSelections(selections, (node, parent) => {
        let unit: ArmyListUnit | null = null

        if (node.type === "unit" && parent?.type !== "unit") {
            unit = buildArmyListUnit(node)
        } else if (node.type === "model" && parent?.type !== "unit") {
            unit = buildArmyListUnitFromModel(node)
        }

        if (!unit || unit.points <= 0) return
        units.push(unit)
    })

    // ✅ จัดการดึง Detachment Rules แบบผสานรวมเนื้อหา 100%
    let parsedDetachmentRules: ArmyRule[] = [];
    if (detachment) {
        const detachmentName = detachment.name || "";
        const wahaRules = getWahapediaDetachmentRules(detachmentName);
        const ruleMap = new Map<string, any>();

        // 🌟 1. ดึงกฎหลักจาก Wahapedia ใส่ลงไปก่อน
        if (wahaRules && wahaRules.length > 0) {
            wahaRules.forEach((r, i) => {
                ruleMap.set(r.name.toLowerCase().trim(), {
                    id: `waha-det-${i}`,
                    name: r.name,
                    description: r.description
                });
            });
        }

        // 🌟 2. สแกนเนื้อหาใน New Recruit
        const processRule = (rawName: string, rawDesc: string, id: string) => {
            if (!rawName || !rawDesc) return;
            
            let cleanRuleName = rawName.replace(/\(detachment.*?\)/gi, '').trim();
            
            // 🛑 หั่นขยะ: ตัดคำว่า Detachment Rule ที่ขึ้นต้นอยู่ออก
            let cleanedRawDesc = rawDesc.replace(/^detachment rule\s*/i, '').trim();
            
            const cleanOriginalDesc = cleanedRawDesc
                .replace(/\*\*\^\^(.*?)\^\^\*\*/g, '<strong>$1</strong>')
                .replace(/\^\^(.*?)\^\^/g, '<strong>$1</strong>');
            
            // 🎯 ใช้การสืบเนื้อหากลับ (Reverse Lookup)
            const reverseMatch = findWahapediaRuleByText(cleanedRawDesc);
            
            let finalName = reverseMatch ? reverseMatch.name : cleanRuleName;
            let finalDesc = reverseMatch ? reverseMatch.description : cleanOriginalDesc;

            // กรองเนื้อหาซ้ำซ้อน
            const searchWords = cleanedRawDesc.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase().split(/\s+/).filter(w => w.length > 4);
            let alreadyExists = false;
            for (const existingRule of ruleMap.values()) {
                const cleanExistingDesc = (existingRule.description || "").replace(/<[^>]*>?/gm, ' ').replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();
                const matchCount = searchWords.filter(w => cleanExistingDesc.includes(w)).length;
                if (searchWords.length > 0 && matchCount >= Math.min(4, Math.ceil(searchWords.length * 0.4))) {
                    alreadyExists = true;
                    break;
                }
            }

            // ถ้าระบบบอกว่าเนื้อหานี้มีอยู่แล้ว ให้ข้ามไปเลย
            if (alreadyExists) return;
            
            // ถ้าเนื้อหาสั้นเกินไป (เช่นมีแต่คำว่า Detachment Rule) ให้ข้ามไปเลย
            if (cleanedRawDesc.length <= 5) return;

            // 🛑 กฎเหล็ก: ห้ามสร้างหัวข้อที่ชื่อซ้ำกับ Detachment หรือชื่อ "Detachment Rule" 
            const lowerFinalName = finalName.toLowerCase();
            const isTrashName = lowerFinalName === detachmentName.toLowerCase() || lowerFinalName === 'detachment rule' || lowerFinalName === 'detachment rules';

            if (isTrashName) {
                // ถ้าเป็นชื่อขยะ ให้เอาเนื้อหาไปต่อท้าย Note ของกฎข้อแรกแทน (เพื่อป้องกันการมีหัวข้อซ้ำซ้อน)
                const firstRuleKey = Array.from(ruleMap.keys())[0];
                if (firstRuleKey) {
                    const mainRule = ruleMap.get(firstRuleKey);
                    if (!mainRule.description.includes(finalDesc)) {
                        mainRule.description += `<br/><br/><div style="padding-left: 10px; border-left: 3px solid #ccc;"><em>Note: ${finalDesc}</em></div>`;
                    }
                }
                return; // 💥 หยุดการทำงาน ไม่ต้องสร้าง Entry ใหม่เด็ดขาด
            }

            // ถ้าเป็นกฎใหม่ที่ชื่อถูกต้อง (เช่น ) ให้เพิ่มเข้าไปใน Map
            const finalKey = finalName.toLowerCase().trim();
            if (ruleMap.has(finalKey)) {
                const existing = ruleMap.get(finalKey);
                if (!existing.description.includes(finalDesc)) {
                     existing.description += `<br/><br/><div style="padding-left: 10px; border-left: 3px solid #ccc;"><em>Note: ${finalDesc}</em></div>`;
                }
            } else {
                ruleMap.set(finalKey, {
                    id: id || `nr-det-${finalKey}`,
                    name: finalName,
                    description: finalDesc
                });
            }
        };

        const walkDetachment = (node: any) => {
            if (!node) return;
            
            if (node.rules) {
                node.rules.forEach((rule: any) => {
                    processRule(rule.name, rule.description || "", rule.id || "");
                });
            }

            if (node.profiles) {
                node.profiles.forEach((profile: any) => {
                    if (profile.characteristics?.some((c: any) => c.name === "Range" || c.name === "WS" || c.name === "M")) return;

                    const parts: string[] = [];
                    if (profile.characteristics) {
                        for (const c of profile.characteristics) {
                            const value = c.$text ?? c.value;
                            if (value) parts.push(value);
                        }
                    }
                    if (parts.length > 0) {
                        processRule(profile.name, parts.join("\n"), profile.id || "");
                    }
                });
            }

            if (node.selections && node.selections.length > 0) {
                node.selections.forEach(walkDetachment);
            }
        };

        walkDetachment(detachment);

        parsedDetachmentRules = Array.from(ruleMap.values());
    }

    return {
        meta: {
            name: roster.name,
            faction: force.catalogueName ?? force.name,
            points: { used, limit },
        },
        armyRules,
        detachment: detachment?.id
            ? {
                id: detachment.id,
                name: detachment.name,
                rules: parsedDetachmentRules,
            }
            : undefined,
        units,
    }
}