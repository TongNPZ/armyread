// app/lib/parser/armyList/normalizeArmyRules.ts
import type { Force, ArmyRule } from "../roster/rosterImportTypes"
import { walkSelections } from "../roster/walkSelections"
// ✅ Import ฟังก์ชันค้นหาจาก Wahapedia
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
    "Range",
    "A",
    "Attacks",
    "WS",
    "BS",
    "S",
    "Strength",
    "AP",
    "D",
    "Damage",
    "Keywords",
])

/* unit-bound แบบตัดทิ้งทันที (relic / enhancement แน่นอน) */
const HARD_UNIT_BOUND_PHRASES = [
    "the bearer",
    "equipped by the bearer",
    "model only",
    "this fortification",
]

/* unit-bound แบบ soft (ต้องดูร่วมกับอย่างอื่น) */
const SOFT_UNIT_BOUND_PHRASES = [
    "this model",
    "this unit",
]

export function normalizeArmyRules(
    force?: Force
): ArmyRuleWithReferences[] {
    if (!force) return []

    let mainRuleBase: ArmyRule | undefined
    const seen = new Set<string>()
    const referenceGroups: ArmyRuleReferenceGroup[] = []

    walkSelections(force.selections ?? [], node => {
        /* ===== 1️⃣ Army Rule หลัก ===== */
        node.rules?.forEach(rule => {
            if (
                !mainRuleBase &&
                rule.description?.includes("If your Army Faction is")
            ) {
                // ✅ ลองหา Description ที่ดีกว่าจาก CSV
                const betterDesc = getAbilityDescription(rule.name);

                mainRuleBase = {
                    id: rule.id,
                    name: rule.name,
                    description: betterDesc || rule.description, // ใช้ของดีกว่าถ้ามี
                }
                seen.add(rule.id)
            }
        })

        /* ===== 2️⃣ Reference groups ===== */
        if (
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
                const hasHardUnitBound =
                    HARD_UNIT_BOUND_PHRASES.some(p =>
                        textBlob.includes(p)
                    )
                if (hasHardUnitBound) return

                /* ❌ 3) ตัด soft unit-bound เฉพาะกรณีแก้ weapon stat */
                const hasSoftUnitBound =
                    SOFT_UNIT_BOUND_PHRASES.some(p =>
                        textBlob.includes(p)
                    )

                const modifiesWeaponStats =
                    textBlob.includes("strength characteristic") ||
                    textBlob.includes("armour penetration") ||
                    textBlob.includes("damage characteristic")

                if (hasSoftUnitBound && modifiesWeaponStats) return

                const id = profile.id ?? profile.name
                if (!id || seen.has(id)) return
                seen.add(id)

                // ✅ ค้นหา Description จาก Wahapedia สำหรับกฎย่อย
                const betterDesc = getAbilityDescription(profile.name ?? "");

                if (betterDesc) {
                    // ถ้าหาเจอ ใช้ของ Wahapedia ทันที
                    rules.push({
                        id,
                        name: profile.name ?? "Rule",
                        description: betterDesc,
                    })
                } else {
                    // ===== ถ้าหาไม่เจอ ใช้ fallback build description แบบเดิม =====
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
    })

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