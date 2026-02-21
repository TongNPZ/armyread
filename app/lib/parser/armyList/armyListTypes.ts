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

export type Stratagem = {
    id: string;
    name: string;
    type: string;        
    cp_cost: string;     
    turn: string;        
    phase: string;       
    description: string; 
    legend?: string;     
}

export type Detachment = {
    id: string;
    name: string;
    rules: { id: string; name: string; description: string }[]; 
    stratagems: Stratagem[]; 
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
    wargear: { name: string; count: number }[]
    // ✅ เพิ่ม description ให้ enhancements
    enhancements: { name: string; points?: number; description?: string }[]
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