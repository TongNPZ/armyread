// app/lib/constants/factionColors.ts

export const DEFAULT_COLOR = "#206173"

export const FACTION_COLORS: Record<string, string> = {
    "Adeptus Astartes": "#536766",
    "Space Marines": "#536766", // Catch-all for generics
    "Blood Angels": "#761119",
    "Space Wolves": "#3e646f",
    "Imperial Fists": "#b87d00",
    "Raven Guard": "#2b2b2b",
    "Salamanders": "#098a49",
    "White Scars": "#783028",
    "Dark Angels": "#014419",
    "Black Templars": "#002f42",
    "Deathwatch": "#44494d",
    "Adeptus Custodes": "#765c41",
    "Adeptus Mechanicus": "#a03332",
    "Adepta Sororitas": "#5e0a00",
    "Astra Militarum": "#375441",
    "Grey Knights": "#4a6672",
    "Imperial Knights": "#03495e",
    "Daemons": "#383c46",
    "Legiones Daemonica": "#383c46",
    "Chaos Space Marines": "#1d3138",
    "World Eaters": "#883531",
    "Death Guard": "#576011",
    "Chaos Knights": "#513627",
    "Thousand Sons": "#015d68",
    "Necrons": "#005c2f",
    "Orks": "#4b6621",
    "Tyranids": "#44264C",
    "Genestealer Cults": "#44264C",
    "Aeldari": "#1f787f",
    "Craftworlds": "#1f787f",
    "Drukhari": "#1f787f", // Usually similiar or darker teal
    "Harlequins": "#6f322f",
    "Leagues of Votann": "#7d4c08",
    "T'au Empire": "#206173",
    "Tau Empire": "#206173"
}

export function getFactionColor(factionName?: string): string {
    if (!factionName) return DEFAULT_COLOR

    // พยายามหา key ที่ตรงหรือมีส่วนคล้ายกัน
    const key = Object.keys(FACTION_COLORS).find(k =>
        factionName.toLowerCase().includes(k.toLowerCase())
    )

    return key ? FACTION_COLORS[key] : DEFAULT_COLOR
}