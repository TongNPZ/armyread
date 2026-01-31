// app/lib/parser/armyList/armyListTypes.ts

export type ArmyListWeapon = {
    name: string
    count: number
    range?: string
    attacks?: string
    skill?: string
    strength?: string
    ap?: string
    damage?: string
    abilities?: string
}

export type ArmyListModel = {
    name: string
    count: number
    weapons: ArmyListWeapon[]
    extras: { name: string; points?: number }[]
}

export type StatItem = {
    name: string
    value: string
}

export type AbilityRule = {
    name: string
    description: string
}

export type ArmyListUnit = {
    id: string
    name: string
    category: string
    points: number
    isWarlord: boolean
    models: ArmyListModel[]
    // ✅ เพิ่มฟิลด์ใหม่สำหรับ Datasheet
    stats?: StatItem[]
    abilities?: Record<string, AbilityRule[]>
    keywords?: string[]
    factionKeywords?: string[]
}