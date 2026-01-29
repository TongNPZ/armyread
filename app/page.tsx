"use client"

import { useState } from "react"
import { buildArmyListUnit } from "./lib/parser/buildArmyListUnit"
import { buildArmyListUnitFromModel } from "./lib/parser/buildArmyListUnitFromModel"
import { walkSelections } from "./lib/parser/walkSelections"
import type {
    SelectionNode,
    NewRecruitRoster,
    Force,
    ArmyRule
} from "./lib/parser/types"
import type { ArmyListUnit } from "./lib/parser/armyListTypes"

function getUnitCategory(unit: ArmyListUnit): string {
    const name = unit.name.toLowerCase()

    if (name.includes("lion") || name.includes("azrael")) return "EPIC HEROES"
    if (name.includes("ancient")) return "CHARACTER"
    if (name.includes("intercessor squad")) return "BATTLELINE"

    return "OTHER DATASHEETS"
}

export default function Page() {
    /* ===== UPLOAD STATE ===== */
    const [data, setData] = useState<NewRecruitRoster | null>(null)

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = ev => {
            try {
                const json = JSON.parse(ev.target?.result as string)
                setData(json)
            } catch {
                alert("Invalid New Recruit JSON file")
            }
        }
        reader.readAsText(file)
    }

    const roster = data?.roster
    const force = roster?.forces?.[0] as Force | undefined
    const selections = (force?.selections ?? []) as SelectionNode[]

    /* ===== POINTS (from roster, NOT calculated) ===== */
    const usedPts =
        roster?.costs?.find(c => c.name === "pts")?.value

    const limitPts =
        roster?.costLimits?.find(c => c.name === "pts")?.value

    /* ===== DETACHMENT (from selections tree) ===== */
    const detachmentNode =
        selections.find(sel => sel.name === "Detachment")

    const detachment =
        detachmentNode?.selections?.[0]

    /* ===== BUILD UNITS ===== */
    const units: ArmyListUnit[] = []

    walkSelections(selections, (node, parent) => {
        let unit: ArmyListUnit | null = null

        if (node.type === "unit") {
            unit = buildArmyListUnit(node)
        } else if (node.type === "model" && parent?.type !== "unit") {
            unit = buildArmyListUnitFromModel(node)
        }

        if (unit) units.push(unit)
    })

    const warlordUnit = units.find(u => u.isWarlord)

    /* ===== GROUP + SORT ===== */
    const grouped = units.reduce<Record<string, ArmyListUnit[]>>((acc, u) => {
        const cat = getUnitCategory(u)
        acc[cat] ??= []
        acc[cat].push(u)
        return acc
    }, {})

    Object.values(grouped).forEach(list => {
        list.sort((a, b) => {
            if (a.isWarlord && !b.isWarlord) return -1
            if (!a.isWarlord && b.isWarlord) return 1
            if (b.points !== a.points) return b.points - a.points
            return a.name.localeCompare(b.name)
        })
    })

    return (
        <main className="p-8 max-w-5xl mx-auto space-y-10 text-gray-100 bg-zinc-950">

            {/* ===== TITLE + UPLOAD ===== */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold tracking-wide">
                    Army List
                </h1>

                <div className="flex justify-center">
                    <label className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition">
                        Upload Army List JSON File
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleUpload}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {!roster && (
                <div className="text-center text-zinc-500 text-sm">
                    Please upload a New Recruit JSON file to view the army list.
                </div>
            )}

            {roster && (
                <>
                    {/* ===== ARMY HEADER ===== */}
                    <section className="space-y-4 border border-zinc-700 rounded-xl p-6 bg-zinc-900/80 shadow-[0_0_25px_rgba(255,255,255,0.05)]">

                        <div className="text-sm uppercase tracking-wide text-zinc-400">
                            FACTION KEYWORD:
                            <span className="ml-2 text-zinc-200 font-medium">
                                {force?.catalogueName ?? force?.name}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="text-zinc-400">
                                    TOTAL ARMY POINTS:
                                </span>{" "}
                                <span className="font-semibold text-red-500">
                                    {usedPts}
                                </span>
                                <span className="text-zinc-400">
                                    {" "} / {limitPts} pts
                                </span>
                            </div>

                            <div>
                                <span className="text-zinc-400">WARLORD:</span>{" "}
                                <span className="font-semibold text-red-500">
                                    {warlordUnit?.name ?? "—"}
                                </span>
                            </div>

                            <div>
                                <span className="text-zinc-400">
                                    NUMBER OF UNITS:
                                </span>{" "}
                                <span className="font-semibold text-zinc-100">
                                    {units.length}
                                </span>
                            </div>
                        </div>

                        {/* ===== ARMY RULE ===== */}
                        {force?.rules?.map((rule: ArmyRule) => (
                            <div key={rule.id} className="text-sm space-y-1">
                                <div>
                                    <span className="text-zinc-400">
                                        Army Rule:
                                    </span>{" "}
                                    <span className="font-medium text-zinc-200">
                                        {rule.name}
                                    </span>
                                </div>
                                <div className="text-zinc-400 whitespace-pre-line">
                                    {rule.description}
                                </div>
                            </div>
                        ))}

                        {/* ===== DETACHMENT ===== */}
                        {detachment && (
                            <div className="text-sm space-y-1">
                                <div>
                                    <span className="text-zinc-400">
                                        DETACHMENT:
                                    </span>{" "}
                                    <span className="font-medium text-zinc-200">
                                        {detachment.name}
                                    </span>
                                </div>

                                {detachment.rules?.map(rule => (
                                    <div
                                        key={rule.id}
                                        className="text-zinc-400 whitespace-pre-line"
                                    >
                                        {rule.description}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ===== UNITS ===== */}
                    {Object.entries(grouped).map(([category, list]) => (
                        <section key={category} className="space-y-4">
                            <h2 className="text-xl font-semibold text-zinc-300 border-b border-zinc-700 pb-1">
                                {category}
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {list.map(unit => (
                                    <div
                                        key={unit.id}
                                        className="rounded-lg bg-zinc-900/80 border border-zinc-700 p-4 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                                    >
                                        <div className="flex justify-between items-baseline">
                                            <div className="font-semibold text-lg">
                                                {unit.name}
                                            </div>
                                            <div className="text-zinc-400">
                                                {unit.points} pts
                                            </div>
                                        </div>

                                        {unit.isWarlord && (
                                            <div className="text-sm font-semibold text-red-500 mt-1">
                                                Warlord
                                            </div>
                                        )}

                                        {unit.models.map(model => {
                                            const enhancements =
                                                model.extras?.filter(
                                                    e =>
                                                        !e.name
                                                            .toLowerCase()
                                                            .includes("warlord")
                                                ) ?? []

                                            return (
                                                <div
                                                    key={model.name}
                                                    className="mt-3 space-y-1"
                                                >
                                                    <div className="font-medium">
                                                        {model.count}x {model.name}
                                                    </div>

                                                    {model.weapons.length > 0 && (
                                                        <ul className="ml-4 list-disc text-sm text-zinc-400">
                                                            {model.weapons.map(w => (
                                                                <li key={w.name}>
                                                                    {w.count}x {w.name}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}

                                                    {enhancements.length > 0 && (
                                                        <ul className="ml-4 list-disc text-sm text-purple-400">
                                                            {enhancements.map(e => (
                                                                <li key={e.name}>
                                                                    Enhancements: {e.name}
                                                                    {e.points
                                                                        ? ` (+${e.points} pts)`
                                                                        : ""}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </>
            )}
        </main>
    )
}
