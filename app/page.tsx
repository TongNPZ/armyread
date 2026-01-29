import data from "./Da-new.json"
import { parseUnitEntries } from "./lib/parser"
import { buildArmyListUnit } from "./lib/parser/buildArmyListUnit"
import { buildArmyListUnitFromModel } from "./lib/parser/buildArmyListUnitFromModel"
import { walkSelections } from "./lib/parser/walkSelections"
import type { SelectionNode } from "./lib/parser/types"
import type { ArmyListUnit } from "./lib/parser/armyListTypes"

function isArmyListUnitNode(node: SelectionNode): boolean {
    if (node.type === "model") return false

    // มี model ใต้ตัวเอง
    const hasModelChild = node.selections?.some(
        s => s.type === "model"
    )

    // หรือมี profile (datasheet)
    const hasProfiles = !!node.profiles?.length

    return Boolean(hasModelChild || hasProfiles)
}

export default function Page() {
    const selections = data.roster.forces[0].selections as SelectionNode[]
    // raw normalized (ไว้ใช้ Datasheet ต่อ)
    const entries = parseUnitEntries(selections)
    // Army List
    const units: ArmyListUnit[] = []

    walkSelections(selections, (node, parent) => {
        let unit: ArmyListUnit | null = null

        // case 1: squad / unit
        if (node.type === "unit") {
            unit = buildArmyListUnit(node)
        }

        // case 2: standalone model เท่านั้น
        else if (
            node.type === "model" &&
            parent?.type !== "unit"   // ⭐ เงื่อนไขสำคัญที่สุด
        ) {
            unit = buildArmyListUnitFromModel(node)
        }

        if (unit) {
            units.push(unit)
        }
    })


    console.log("ARMY LIST UNITS", units)
    console.log(
        "RAW UNIT ENTRIES",
        Object.values(entries).map(e => ({
            name: e.name,
            total: e.totalModels,
            models: e.models,
        }))
    )

    return <main>ArmyRead</main>
}
