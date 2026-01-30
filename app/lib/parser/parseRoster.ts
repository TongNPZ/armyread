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

    const used =
        roster.costs?.find(c => c.name === "pts")?.value

    const limit =
        roster.costLimits?.find(c => c.name === "pts")?.value

    const detachmentNode =
        selections.find(s => s.name === "Detachment")

    const detachment =
        detachmentNode?.selections?.[0]

    /* ✅ ตรงนี้เท่านั้น */
    const armyRules = normalizeArmyRules(force)

    console.log("NORMALIZED ARMY RULES:", armyRules)
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
    console.log("FORCE:", force)
    console.log("FORCE.RULES:", force.rules)
    console.log("FORCE.SELECTIONS:", force.selections)
    return {
        meta: {
            name: roster.name,
            faction: force.catalogueName ?? force.name,
            points: { used, limit },
        },

        armyRules, // ✅ ตอนนี้จะมี Blessings of Khorne แล้ว

        detachment: detachment?.id
            ? {
                id: detachment.id,
                name: detachment.name,
                rules: detachment.rules,
            }
            : undefined,

        units,
    }
}
