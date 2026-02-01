// app/lib/parser/armyList/armyListTypes.ts

// ✅ Profile ของอาวุธ (เช่น Strike Profile, Sweep Profile)
export type WeaponProfile = {
    name: string
    keywords: string[]
    range: string
    attacks: string
    skill: string
    strength: string
    ap: string
    damage: string
}

// ✅ โครงสร้างอาวุธหลัก (เก็บ Profile ย่อยไว้ข้างใน)
export type ArmyListWeapon = {
    name: string
    count: number
    profiles: WeaponProfile[]
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
    stats?: StatItem[]
    // ✅ แบ่งหมวดหมู่ Ability ให้ชัดเจน
    abilities?: Record<string, AbilityRule[]>
    keywords?: string[]
    factionKeywords?: string[]
}