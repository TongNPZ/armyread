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

// ✅ 1. Import ฟังก์ชันค้นหาจาก Wahapedia เข้ามา
import { getAbilityDescription } from "../wahapedia/lookup"

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

export function parseRoster(
    data: RosterType
): ParsedRoster | null {
    const roster = data.roster
    if (!roster) return null

    const force = roster.forces?.[0] as Force | undefined
    if (!force) return null

    const selections = (force.selections ?? []) as SelectionNode[]

    const used = roster.costs?.find(c => c.name === "pts")?.value
    const limit = roster.costLimits?.find(c => c.name === "pts")?.value

    const detachmentNode = selections.find(s => s.name === "Detachment")
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
                // ✅ 2. นำฟังก์ชันมาครอบตรง Detachment Rules
                rules: (detachment.rules || []).map((rule: any) => ({
                    ...rule,
                    description: getAbilityDescription(rule.name) || rule.description
                })),
            }
            : undefined,

        units,
    }
}