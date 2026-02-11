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
    type: string;        // เช่น "Battle Tactic", "Epic Deed"
    cp_cost: string;     // เช่น "1CP", "2CP"
    turn: string;        // เช่น "Either", "Your", "Opponent" (เอาไว้ทำขอบการ์ด)
    phase: string;       // เช่น "Any", "Command", "Shooting" (เอาไว้โชว์ icon เพชร)
    description: string; // คำอธิบาย HTML
    legend?: string;     // ข้อความสั้นๆ ใต้ชื่อ (ถ้ามี)
}

// อัปเดต ParsedRoster หรือ Detachment ให้รับ Stratagem
export type Detachment = {
    id: string;
    name: string;
    rules: { id: string; name: string; description: string }[]; // กฎ Detachment เดิม
    stratagems: Stratagem[]; // ✅ เพิ่มอันนี้เข้าไป
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