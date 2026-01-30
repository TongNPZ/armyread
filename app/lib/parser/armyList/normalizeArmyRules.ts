// app/lib/parser/armyList/normalizeArmyRules.ts
import type { Force, ArmyRule } from "../roster/rosterImportTypes"
import { walkSelections } from "../roster/walkSelections"

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

/* characteristic ที่บ่งบอกว่าเป็น stat block */
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

export function normalizeArmyRules(
    force?: Force
): ArmyRuleWithReferences[] {
    if (!force) return []

    let mainRuleBase: ArmyRule | undefined
    const seen = new Set<string>()
    const referenceGroups: ArmyRuleReferenceGroup[] = []

    walkSelections(force.selections ?? [], (node) => {
        /* ===== 1️⃣ Army Rule หลัก ===== */
        node.rules?.forEach(rule => {
            if (
                !mainRuleBase &&
                rule.description?.includes("If your Army Faction is")
            ) {
                mainRuleBase = {
                    id: rule.id,
                    name: rule.name,
                    description: rule.description,
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

                /* ❌ 2) ตัด bearer-bound rule (Scattershield ฯลฯ) */
                const isBearerRule = profile.characteristics.some(c =>
                    (c.$text ?? c.value)
                        ?.toLowerCase()
                        .startsWith("the bearer")
                )
                if (isBearerRule) return

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

                if (parts.length === 0) return

                const id = profile.id ?? profile.name
                if (!id || seen.has(id)) return
                seen.add(id)

                rules.push({
                    id,
                    name: profile.name ?? "Rule",
                    description: parts.join("\n"),
                })
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
