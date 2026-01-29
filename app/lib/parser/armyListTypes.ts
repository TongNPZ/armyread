export type ArmyListUnit = {
    id: string
    name: string
    points: number
    isWarlord?: boolean
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
