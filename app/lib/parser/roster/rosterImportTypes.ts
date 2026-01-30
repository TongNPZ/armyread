export type Cost = {
    name: string
    value: number
}

export type ArmyRule = {
    id: string
    name: string
    description: string
}

export type ProfileCharacteristic = {
    name: string
    value: string
    $text?: string
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

    categories?: Category[]
    costs?: Cost[]
    rules?: ArmyRule[]
    profiles?: Profile[]
    selections?: SelectionNode[]
}

export type Force = {
    name?: string
    catalogueName?: string
    faction?: string

    rules?: ArmyRule[]
    selections?: SelectionNode[]
}

export type RosterType = {
    roster?: {
        name?: string
        costs?: Cost[]
        costLimits?: Cost[]
        forces?: Force[]
    }
}

export type CostEntry = {
    name: string
    value: number
}

export type Category = {
    id?: string
    entryId?: string
    name?: string
    primary?: boolean   // ⭐ สำคัญมาก
}