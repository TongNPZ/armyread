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
export type ProfileCharacteristic = {
    name: string
    value: string
}

export type Profile = {
    id?: string
    name?: string
    typeName?: string
    characteristics?: ProfileCharacteristic[]
}

export type SelectionNode = {
    id?: string
    name?: string
    type?: string
    number?: number

    categories?: { name?: string }[]
    costs?: { name?: string; value?: number }[]

    profiles?: Profile[]
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

export type ModelEntry = {
    id: string
    name: string
    count: number
}

export type UnitEntry = {
    id: string
    name: string

    points?: number

    models: ModelEntry[]
    totalModels: number

    /**
     * raw reference (for leader attach / stratagem later)
     */
    rawNode?: SelectionNode
}

export type NewRecruitRoster = {
    roster?: {
        forces?: {
            selections?: SelectionNode[]
        }[]
    }
}

function hasModelChildren(node: SelectionNode): boolean {
    return !!node.selections?.some(s => s.type === "model")
}

type ArmyListUnit = {
    name: string
    points: number

    role?: "CHARACTER" | "BATTLELINE" | "VEHICLE" | string

    models: {
        name: string
        count: number

        weapons: {
            name: string
            count: number
        }[]

        extras?: {
            name: string
            points?: number
        }[]
    }[]

    keywords?: string[] // เช่น Warlord
}

