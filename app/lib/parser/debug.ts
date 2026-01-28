import rawData from "../../Da-new.json"
import { walkSelections } from "./walkSelections"
import type { NewRecruitRoster } from "./types"

const data = rawData as NewRecruitRoster

export function debugWalkSelections() {
    console.log("=== DEBUG WALK SELECTIONS START ===")

    walkSelections(
        data.roster?.forces?.[0]?.selections,
        (node, depth) => {
            if (node.type === "model") {
                console.log(
                    " ".repeat(depth * 2) + "- " + (node.name ?? "UNKNOWN MODEL")
                )
            }
        }
    )

    console.log("=== DEBUG WALK SELECTIONS END ===")
}
