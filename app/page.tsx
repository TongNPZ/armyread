"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { parseRoster } from "./lib/parser/parseRoster"
import type { ParsedRoster } from "./lib/parser/parseRoster"
import type { RosterType } from "./lib/parser/roster/rosterImportTypes"
import type { ArmyListUnit } from "./lib/parser/armyList/armyListTypes"
import { CATEGORY_ORDER } from "./lib/parser/armyList/getUnitCategory"

type OpenRule =
    | { type: "army"; id: string }
    | { type: "detachment"; id: string }
    | null

export default function Page() {
    const [parsed, setParsed] = useState<ParsedRoster | null>(null)
    const [openRule, setOpenRule] = useState<OpenRule>(null)

    function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = ev => {
            try {
                const json = JSON.parse(
                    ev.target?.result as string
                ) as RosterType

                setParsed(parseRoster(json))
            } catch {
                alert("Invalid New Recruit JSON file")
            }
        }
        reader.readAsText(file)
    }

    function handleClear() {
        setParsed(null)
        setOpenRule(null)
    }

    if (!parsed) {
        return (
            <main className="mx-auto max-w-screen-xl px-6 py-20 text-center bg-zinc-950 text-gray-100 space-y-8">
                <h1 className="text-3xl font-bold">Army List</h1>

                <label className="cursor-pointer border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800 inline-block">
                    Upload Army List JSON
                    <input
                        type="file"
                        accept=".json"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </label>
            </main>
        )
    }

    const { meta, units, armyRules, detachment } = parsed
    const warlordUnit = units.find(u => u.isWarlord)

    const grouped = units.reduce<Record<string, ArmyListUnit[]>>(
        (acc, unit) => {
            const cat = unit.category ?? "OTHER"
            acc[cat] ??= []
            acc[cat].push(unit)
            return acc
        },
        {}
    )

    const orderedCategories = [
        ...CATEGORY_ORDER,
        ...Object.keys(grouped).filter(
            c => !CATEGORY_ORDER.includes(c as any)
        ),
    ]

    return (
        <main className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-10 py-10 space-y-10 bg-zinc-950 text-gray-100">

            {/* ===== HEADER ===== */}
            <section className="border border-zinc-700 bg-zinc-900/80 p-6 space-y-4">
                <div className="flex justify-between">
                    <div>
                        <div className="text-zinc-400 uppercase text-sm">
                            Faction
                        </div>
                        <div className="text-xl font-semibold">
                            {meta.faction}
                        </div>
                    </div>

                    <button
                        onClick={handleClear}
                        className="text-sm text-zinc-400 hover:text-red-400"
                    >
                        Clear & Upload New
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-zinc-400">Points:</span>{" "}
                        <span className="text-red-500 font-semibold">
                            {meta.points.used}
                        </span>
                        <span className="text-zinc-400">
                            {" "} / {meta.points.limit} pts
                        </span>
                    </div>
                    <div>
                        <span className="text-zinc-400">Warlord:</span>{" "}
                        <span className="text-red-500 font-semibold">
                            {warlordUnit?.name ?? "—"}
                        </span>
                    </div>
                    <div>
                        <span className="text-zinc-400">Units:</span>{" "}
                        {units.length}
                    </div>
                </div>

                {/* ===== ARMY RULES ===== */}
                {armyRules.map(rule => (
                    <div key={rule.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-lg">
                                Army Rule: {rule.name}
                            </div>
                        </div>

                        <div className="text-sm text-zinc-400 line-clamp-10 whitespace-pre-line">
                            {rule.description}
                        </div>
                        <div className="flex justify-end">
                            <button
                                onClick={() =>
                                    setOpenRule({
                                        type: "army",
                                        id: rule.id,
                                    })
                                }
                                className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition"
                            >
                                Read full rule
                            </button>
                        </div>
                    </div>
                ))}

                {/* ===== DETACHMENT (STYLE LIKE ARMY RULE) ===== */}
                {detachment && (
                    <div className="space-y-1 pt-2">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-lg">
                                Detachment: {detachment.name}
                            </div>

                        </div>

                        {detachment.rules?.[0] && (
                            <div className="text-sm text-zinc-400 line-clamp-3 whitespace-pre-line">
                                {detachment.rules[0].description}
                            </div>
                        )}
                        <div className="flex justify-end">
                            <button
                                onClick={() => setOpenRule({ type: "detachment", id: detachment.id })}
                                className="text-xs px-3 py-1 rounded-full border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-500 transition"
                            >
                                Read detachment
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ===== CATEGORIES (2 COL) ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orderedCategories.map(category => {
                    const list = grouped[category]
                    if (!list?.length) return null

                    Object.values(grouped).forEach(list => {
                        list.sort((a, b) => {
                            // 1️⃣ Warlord มาก่อน
                            if (a.isWarlord && !b.isWarlord) return -1
                            if (!a.isWarlord && b.isWarlord) return 1

                            // 2️⃣ points มากก่อน
                            if (a.points !== b.points) return b.points - a.points

                            // 3️⃣ ชื่อ A-Z
                            return a.name.localeCompare(b.name)
                        })
                    })

                    return (
                        <section
                            key={category}
                            className="border border-zinc-700 bg-zinc-900/80 p-4 space-y-4"
                        >
                            <h2 className="text-xl font-semibold border-b border-zinc-700 pb-1">
                                {category}
                            </h2>

                            {list.map((unit, idx) => (
                                <div key={unit.id} className="space-y-2">

                                    <div className="flex justify-between">
                                        <div className="font-semibold">
                                            {unit.name}
                                        </div>
                                        <div className="text-zinc-400">
                                            {unit.points} pts
                                        </div>
                                    </div>

                                    {unit.isWarlord && (
                                        <div className="text-xs text-red-500 font-semibold">
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
                                            <div key={model.name} className="ml-2 space-y-1">
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
                                                                Enhancement: {e.name}
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

                                    {/* ===== DIVIDER ระหว่าง UNIT ===== */}
                                    {idx < list.length - 1 && (
                                        <div className="border-t border-zinc-700/70 pt-2 mt-3" />
                                    )}
                                </div>
                            ))}

                        </section>
                    )
                })}
            </div>

            {/* ===== MODAL ===== */}
            <AnimatePresence>
                {openRule && (
                    <motion.div
                        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setOpenRule(null)}
                    >

                        <motion.div
                            className="bg-zinc-900 max-w-3xl w-full mx-4 p-6 border border-zinc-700 space-y-4"
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setOpenRule(null)}
                                className="text-sm text-zinc-400 hover:text-zinc-200"
                            >
                                Close ✕
                            </button>

                            {openRule.type === "army" &&
                                armyRules
                                    .filter(r => r.id === openRule.id)
                                    .map(rule => (
                                        <div key={rule.id} className="w-full max-w-3xl max-h-[80vh] flex flex-col p-6">

                                            <div className="space-y-4 overflow-y-auto
                                                    scrollbar-thin
                                                    scrollbar-thumb-zinc-600
                                                    scrollbar-track-transparent
                                                    pr-1">
                                                <h2 className="text-xl font-semibold">
                                                    {rule.name}
                                                </h2>
                                                <div className="whitespace-pre-line text-zinc-300">
                                                    {rule.description}
                                                </div>

                                                {rule.references?.map(ref => (
                                                    <div key={ref.title}>
                                                        <div className="font-medium">
                                                            {ref.title}
                                                        </div>
                                                        {ref.rules.map((r, idx) => (
                                                            <div
                                                                key={r.id}
                                                                className="space-y-1 py-2"
                                                            >
                                                                {/* ชื่อ + Roll */}
                                                                <div className="font-medium text-zinc-200">
                                                                    {idx + 1}. {r.name}
                                                                </div>

                                                                {/* เนื้อหา */}
                                                                <div className="text-sm text-zinc-400 whitespace-pre-line ml-4">
                                                                    {r.description}
                                                                </div>

                                                                {/* เส้นคั่น (ยกเว้นอันสุดท้าย) */}
                                                                {idx < ref.rules.length - 1 && (
                                                                    <div className="border-t border-zinc-700/50 mt-2" />
                                                                )}
                                                            </div>
                                                        ))}

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}

                            {openRule.type === "detachment" &&
                                detachment?.rules?.map(rule => (
                                    <div key={rule.id} className="space-y-4">
                                        <h2 className="text-xl font-semibold">
                                            {detachment.name}
                                        </h2>
                                        <div className="whitespace-pre-line text-zinc-300">
                                            {rule.description}
                                        </div>
                                    </div>
                                ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    )
}
