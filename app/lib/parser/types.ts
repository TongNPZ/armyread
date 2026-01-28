// lib/parser/types.ts

export type Army = {
    name?: string
    faction?: string

    points: {
        used: number
        limit: number
    }

    rules: ArmyRule[]

    units: Record<string, Unit>
}

export type SelectionNode = {
    id?: string
    name?: string
    type?: string
    number?: number

    categories?: { name?: string }[]
    costs?: { name?: string; value?: number }[]

    selections?: SelectionNode[]
}

export type ArmyRule = {
    id: string
    name: string
    description: string
}

export type Unit = {
    id: string
    name: string

    count: number
    points?: number

    keywords: string[]

    stats?: Statline
    abilities: Ability[]
    weapons: Weapon[]

    /**
     * Keep raw profiles for debugging or future features
     */
    rawProfiles?: unknown[]
}

export type Statline = {
    M: string
    T: string
    SV: string
    W: string
    LD: string
    OC: string
}

export type Ability = {
    id: string
    name: string
    description: string

    /**
     * e.g. Datasheet, Leader, Enhancement
     */
    source?: string
}

export type Weapon = {
    id: string
    name: string
    type: "ranged" | "melee"

    range: string
    attacks: string
    skill: string
    strength: string
    ap: string
    damage: string

    keywords: string[]
}
