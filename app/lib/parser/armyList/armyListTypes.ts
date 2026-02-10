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

export type ArmyListWeapon = {
    name: string
    count: number
    profiles: WeaponProfile[]
}

export type ArmyListModel = {
    name: string
    count: number
    weapons: ArmyListWeapon[]
    // ✅ แยกเก็บชัดเจน
    wargear: { name: string; count: number }[]
    enhancements: { name: string; points?: number }[]
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
    abilities?: Record<string, AbilityRule[]>
    keywords?: string[]
    factionKeywords?: string[]
}