// app/lib/parser/armyList/normalizeArmyRules.ts
import type { Force, ArmyRule, SelectionNode } from "../roster/rosterImportTypes"
import { getAbilityDescription } from "../../wahapedia/lookup"

export type ArmyRuleReferenceGroup = {
    title: string
    rules: ArmyRule[]
}

export type ArmyRuleWithReferences = {
    id: string
    name: string
    description: string
    references?: ArmyRuleReferenceGroup[]
}

/* characteristic ที่บ่งบอกว่าเป็น stat / weapon block */
const STAT_CHARACTERISTICS = new Set([
    "Range", "A", "Attacks", "WS", "BS", "S", "Strength", "AP", "D", "Damage", "Keywords",
])

/* unit-bound แบบตัดทิ้งทันที (relic / enhancement แน่นอน) */
const HARD_UNIT_BOUND_PHRASES = [
    "the bearer", "equipped by the bearer", "model only", "this fortification",
]

/* unit-bound แบบ soft (ต้องดูร่วมกับอย่างอื่น) */
const SOFT_UNIT_BOUND_PHRASES = [
    "this model", "this unit",
]

export function normalizeArmyRules(
    force?: Force
): ArmyRuleWithReferences[] {
    if (!force) return []

    let mainRuleBase: ArmyRule | undefined
    const seen = new Set<string>()
    const referenceGroups: ArmyRuleReferenceGroup[] = []

    // ✅ 1. ลองหา Army Rule หลักจาก Force ตรงๆ ก่อน
    force.rules?.forEach(rule => {
        if (!mainRuleBase && rule.description?.includes("If your Army Faction is")) {
            const betterDesc = getAbilityDescription(rule.name);
            mainRuleBase = {
                id: rule.id,
                name: rule.name,
                description: betterDesc || rule.description,
            }
            seen.add(rule.id)
        }
    })

    // ✅ 2. ฟังก์ชันเดินหาข้อมูล โดยพกตัวแปรว่า "ตอนนี้กำลังหาอยู่ข้างในยูนิตหรือไม่"
    const walkForceLevel = (selections: SelectionNode[], isInsideUnit: boolean) => {
        for (const node of selections) {
            
            // 🛑 1. กฎเหล็ก: บล็อกกล่อง Detachment ทุกรูปแบบไม่ให้ทะลุออกไปเป็น Army Rule ขยะ
            const nodeNameLower = (node.name || "").toLowerCase();
            const isDetachmentContainer = 
                nodeNameLower === "detachment" || 
                nodeNameLower === "detachment choice" ||
                node.type === "Detachment" || 
                node.categories?.some(c => c.name === "Detachment" || c.name?.toLowerCase().includes("detachment"));

            if (isDetachmentContainer) {
                continue; // 💥 ข้ามกล่องนี้ไปเลย (ให้ parseRoster เป็นคนจัดการดึง Detachment เอง)
            }

            // เช็คว่า node ปัจจุบันเป็นยูนิต หรืออยู่ในยูนิตอยู่แล้ว
            const currentlyInUnit = isInsideUnit || node.type === "unit" || node.type === "model";

            /* ===== 1️⃣ ค้นหา Army Rule หลัก ===== */
            node.rules?.forEach(rule => {
                if (
                    !mainRuleBase &&
                    rule.description?.includes("If your Army Faction is")
                ) {
                    const betterDesc = getAbilityDescription(rule.name);
                    mainRuleBase = {
                        id: rule.id,
                        name: rule.name,
                        description: betterDesc || rule.description,
                    }
                    seen.add(rule.id)
                }
            })

            /* ===== 2️⃣ ค้นหา Reference groups (กฎกองทัพ) ===== */
            if (
                !currentlyInUnit &&
                node.type === "upgrade" &&
                node.name &&
                node.profiles?.length
            ) {
                const rules: ArmyRule[] = []

                node.profiles.forEach(profile => {
                    if (!profile.characteristics) return

                    /* ❌ 1) ตัด stat / weapon profile */
                    const isStatProfile = profile.characteristics.some(c =>
                        STAT_CHARACTERISTICS.has(c.name)
                    )
                    if (isStatProfile) return

                    const textBlob = profile.characteristics
                        .map(c => (c.$text ?? c.value)?.toLowerCase() ?? "")
                        .join(" ")

                    /* ❌ 2) ตัด hard unit-bound (relic / enhancement) */
                    const hasHardUnitBound = HARD_UNIT_BOUND_PHRASES.some(p => textBlob.includes(p))
                    if (hasHardUnitBound) return

                    /* ❌ 3) ตัด soft unit-bound เฉพาะกรณีแก้ weapon stat */
                    const hasSoftUnitBound = SOFT_UNIT_BOUND_PHRASES.some(p => textBlob.includes(p))
                    const modifiesWeaponStats = textBlob.includes("strength characteristic") || textBlob.includes("armour penetration") || textBlob.includes("damage characteristic")
                    if (hasSoftUnitBound && modifiesWeaponStats) return

                    /* 🛑 4) ตัวป้องกันขั้นสุด: ป้องกันชื่อกฎที่เกี่ยวกับ Detachment ทะลุมาแบบเดี่ยวๆ */
                    const profileNameLower = (profile.name || "").toLowerCase();
                    if (profileNameLower.includes("detachment") || profileNameLower === "vanguard prime") {
                        return; // ข้ามทิ้งไปเลย ไม่ให้โผล่ที่ชั้นนอก
                    }

                    const id = profile.id ?? profile.name
                    if (!id || seen.has(id)) return
                    seen.add(id)

                    // ✅ ค้นหา Description จาก Wahapedia
                    const betterDesc = getAbilityDescription(profile.name ?? "");

                    if (betterDesc) {
                        rules.push({
                            id,
                            name: profile.name ?? "Rule",
                            description: betterDesc,
                        })
                    } else {
                        const parts: string[] = []

                        for (const c of profile.characteristics) {
                            const value = c.$text ?? c.value
                            if (!value) continue

                            if (c.name && c.name !== "Effect") {
                                parts.push(`${c.name}: ${value}`)
                            } else {
                                parts.push(value)
                            }
                        }

                        if (parts.length > 0) {
                            rules.push({
                                id,
                                name: profile.name ?? "Rule",
                                description: parts.join("\n"),
                            })
                        }
                    }
                })

                if (rules.length > 0) {
                    referenceGroups.push({
                        title: node.name,
                        rules,
                    })
                }
            }

            // เดินเข้าไปในลูกๆ ต่อไป
            if (node.selections && node.selections.length > 0) {
                walkForceLevel(node.selections, currentlyInUnit)
            }
        }
    }

    walkForceLevel(force.selections ?? [], false)

    if (!mainRuleBase) return []

    return [
        {
            id: mainRuleBase.id,
            name: mainRuleBase.name,
            description: mainRuleBase.description,
            references:
                referenceGroups.length > 0
                    ? referenceGroups
                    : undefined,
        },
    ]
}