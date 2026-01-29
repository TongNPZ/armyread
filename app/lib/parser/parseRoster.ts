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

export type ParsedRoster = {
    meta: {
        name?: string
        faction?: string
        points: {
            used?: number
            limit?: number
        }
    }

    armyRules: ArmyRule[]
    detachment?: {
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

    const units: ArmyListUnit[] = []

    walkSelections(selections, (node, parent) => {
        let unit: ArmyListUnit | null = null

        // ✅ unit จริง
        if (node.type === "unit" && parent?.type !== "unit") {
            unit = buildArmyListUnit(node)
        }

        // ✅ Hero / Character ที่เป็น model
        else if (node.type === "model" && parent?.type !== "unit") {
            unit = buildArmyListUnitFromModel(node)
        }

        // ❌ กัน unit ผี / model ผี (0 pts)
        if (!unit || unit.points <= 0) return

        units.push(unit)
    })



    return {
        meta: {
            name: roster.name,
            faction: force.catalogueName ?? force.name,
            points: { used, limit },
        },
        armyRules: force.rules ?? [],
        detachment: detachment
            ? {
                name: detachment.name,
                rules: detachment.rules,
            }
            : undefined,
        units,
    }
}