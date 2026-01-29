import type { ArmyListUnit } from "./armyListTypes"

export const CATEGORY_ORDER = [
    "EPIC HERO",
    "CHARACTER",
    "BATTLELINE",
    "INFANTRY",
    "MONSTER",
    "VEHICLE",
    "MOUNTED",
    "SWARM",
    "AIRCRAFT",
    "DEDICATED TRANSPORT",
    "FORTIFICATION",
    "ALLIED UNITS",
    "OTHER DATASHEETS",
] as const

export function getUnitCategory(unit: ArmyListUnit): string {
    return unit.category
}