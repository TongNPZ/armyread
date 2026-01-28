import data from "./Da-new.json"
import { parseUnitEntries } from "./lib/parser"

export default function Page() {
    const entries = parseUnitEntries(
        data.roster.forces[0].selections
    )

    console.log(
        Object.values(entries).map(e => ({
            name: e.name,
            total: e.totalModels,
            models: e.models,
        }))
    )

    return <main>ArmyRead</main>
}
