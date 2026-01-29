// app/lib/parser/armyListTypes.ts
export type ArmyListUnit = {
    id: string
    name: string
    points: number
    isWarlord?: boolean

    category: string     
    keywords?: string[]

    models: ArmyListModel[]
}
export type ArmyListModel = {
    name: string
    count: number

    weapons: {
        name: string
        count: number
    }[]

    extras: {
        name: string
        points?: number
    }[]
}
