// app/lib/parser/armyList/normalizeArmyRules.ts
import type { Force, ArmyRule } from "../roster/rosterImportTypes"
import { walkSelections } from "../roster/walkSelections"

export type ArmyRuleWithReferences = ArmyRule & {
    references?: ArmyRule[]
}

export function normalizeArmyRules(force?: Force): ArmyRuleWithReferences[] {
    if (!force) return []

    let mainRule: ArmyRuleWithReferences | null = null
    const references: ArmyRule[] = []
    const seen = new Set<string>()

    walkSelections(force.selections ?? [], (node, parent) => {
        /* ===== 1️⃣ Army Rule หลัก ===== */
        node.rules?.forEach(rule => {
            if (
                rule.description?.includes("If your Army Faction is")
            ) {
                if (mainRule) return

                mainRule = {
                    id: rule.id,
                    name: rule.name,
                    description: rule.description,
                    references: [],
                }
                seen.add(rule.id)
            }
        })

        /* ===== 2️⃣ Reference tables ===== */
        node.profiles?.forEach(profile => {
            // ❌ ตัด ability / aura / unit / model
            if (
                profile.typeName === "Abilities" ||
                profile.name?.includes("(Aura)") ||
                parent?.type === "unit" ||
                parent?.type === "model" ||
                node.type === "unit" ||
                node.type === "model"
            ) return

            // ✅ reference ต้องขึ้นต้นด้วยเลข
            if (!profile.name || !/^\d+\./.test(profile.name)) return

            const effectChar = profile.characteristics?.find(
                c => c.name === "Effect"
            )

            const effect = effectChar?.$text ?? effectChar?.value


            if (!effect) return

            const id = profile.id ?? profile.name
            if (seen.has(id)) return
            seen.add(id)

            references.push({
                id,
                name: profile.name,
                description: effect,
            })
        })
    })

    if (!mainRule) return []

    if (references.length > 0) {
        mainRule.references!.push(...references)
    }

    return [mainRule]
}
