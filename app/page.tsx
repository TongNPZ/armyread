"use client"

import { useState } from "react"
import { parseRoster } from "./lib/parser/parseRoster"
import type { ParsedRoster } from "./lib/parser/parseRoster"
import type { RosterType } from "./lib/parser/roster/rosterImportTypes"
import type { ArmyListUnit } from "./lib/parser/armyList/armyListTypes"
import { CATEGORY_ORDER } from "./lib/parser/armyList/getUnitCategory"

export default function Page() {
    /* ===== PARSED ROSTER STATE ===== */
    const [parsed, setParsed] = useState<ParsedRoster | null>(null)

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = ev => {
            try {
                const json = JSON.parse(
                    ev.target?.result as string
                ) as RosterType

                const result = parseRoster(json)
                setParsed(result)
            } catch {
                alert("Invalid New Recruit JSON file")
            }
        }
        reader.readAsText(file)
    }

    /* ===== EMPTY STATE ===== */
    if (!parsed) {
        return (
            <main className="p-8 max-w-5xl mx-auto space-y-6 text-gray-100 bg-zinc-950 text-center">
                <h1 className="text-3xl font-bold tracking-wide">
                    Army List
                </h1>

                <label className="cursor-pointer rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 transition inline-block">
                    Upload Army List JSON File
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>

                <div className="text-zinc-500 text-sm">
                    Please upload a New Recruit JSON file to view the army list.
                </div>
            </main>
        )
    }

    /* ===== DESTRUCTURE PARSED DATA ===== */
    const { meta, units, armyRules, detachment } = parsed

    const warlordUnit = units.find(u => u.isWarlord)

    /* ===== GROUP BY REAL CATEGORY ===== */
    const grouped = units.reduce<Record<string, ArmyListUnit[]>>(
        (acc, unit) => {
            const cat = unit.category ?? "OTHER DATASHEETS"
            acc[cat] ??= []
            acc[cat].push(unit)
            return acc
        },
        {}
    )

    /* ===== SORT UNITS IN EACH CATEGORY ===== */
    Object.values(grouped).forEach(list => {
        list.sort((a, b) => {
            if (a.isWarlord && !b.isWarlord) return -1
            if (!a.isWarlord && b.isWarlord) return 1
            if (b.points !== a.points) return b.points - a.points
            return a.name.localeCompare(b.name)
        })
    })

    /* ===== SORT CATEGORY ORDER ===== */
    const orderedCategories = [
        ...CATEGORY_ORDER,
        ...Object.keys(grouped).filter(
            c => !CATEGORY_ORDER.includes(c as any)
        )
    ]

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

            {/* ===== ARMY HEADER ===== */}
            <section className="space-y-4 border border-zinc-700 rounded-xl p-6 bg-zinc-900/80 shadow-[0_0_25px_rgba(255,255,255,0.05)]">

                <div className="text-sm uppercase tracking-wide text-zinc-400">
                    FACTION KEYWORD:
                    <span className="ml-2 text-zinc-200 font-medium">
                        {meta.faction}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-zinc-400">
                            TOTAL ARMY POINTS:
                        </span>{" "}
                        <span className="font-semibold text-red-500">
                            {meta.points.used}
                        </span>
                        <span className="text-zinc-400">
                            {" "} / {meta.points.limit} pts
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

                {/* ===== ARMY RULES ===== */}
                {armyRules.map(rule => (
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
            {orderedCategories.map(category => {
                const list = grouped[category]
                if (!list || list.length === 0) return null

                return (
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
                )
            })}
        </main>
    )
}
