import React, { useState } from "react"
import type { ParsedRoster } from "../lib/parser/parseRoster"
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import type { OpenRule, ViewMode } from "../hooks/useArmyRoster"
import { motion, AnimatePresence } from "framer-motion"

interface Props {
    meta: ParsedRoster['meta']
    units: ArmyListUnit[]
    armyRules: ParsedRoster['armyRules']
    detachment: ParsedRoster['detachment']
    viewMode: ViewMode
    setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>
    onClear: () => void
    setOpenRule: React.Dispatch<React.SetStateAction<OpenRule>>
}

export default function ArmyHeader({ meta, units, armyRules, detachment, viewMode, setViewMode, onClear, setOpenRule }: Props) {
    const warlordUnit = units.find(u => u.isWarlord)
    const [showRules, setShowRules] = useState(true)

    return (
        // ✅ ปรับ Header Container:
        // - pt-4 px-4 space-y-4 : ลด Padding และ Spacing ภายในให้กระชับขึ้น
        <section className="border border-zinc-700 bg-zinc-900/80 pt-4 px-4 space-y-4 rounded-t-lg shadow-lg">
            
            {/* --- TOP ROW --- */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-zinc-400 uppercase text-xs tracking-wider mb-1">
                        Faction Keyword
                    </div>
                    <div className="text-2xl font-black uppercase tracking-tight text-white">
                        {meta.faction}
                    </div>
                </div>

                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear all data?")) {
                            onClear()
                        }
                    }}
                    className="text-xs text-zinc-500 hover:text-red-500 underline decoration-zinc-700 underline-offset-4 transition-colors"
                >
                    Clear Data
                </button>
            </div>

            {/* --- STATS ROW --- */}
            <div className="grid grid-cols-3 gap-4 text-sm border-t border-zinc-800 pt-3 pb-1">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-xs uppercase mb-1">Points</div>
                    <div className="font-mono text-base">
                        <span className="text-red-500 font-bold">{meta.points.used}</span>
                        <span className="text-zinc-600"> / {meta.points.limit}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-xs uppercase mb-1">Units</div>
                    <div className="font-mono text-zinc-300 text-base">{units.length}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-xs uppercase mb-1">Warlord</div>
                    <div className="font-bold text-zinc-200 truncate max-w-[150px] sm:max-w-xs">
                        {warlordUnit?.name ?? "—"}
                    </div>
                </div>
            </div>

            {/* --- COLLAPSIBLE RULES --- */}
            <div className="border-t border-zinc-800 pt-2">
                <button 
                    onClick={() => setShowRules(!showRules)}
                    className="w-full flex items-center justify-center gap-2 py-1 text-zinc-500 hover:text-zinc-300 transition-colors group"
                >
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        {showRules ? "Hide Rules" : "Show Rules"}
                    </span>
                    <motion.span animate={{ rotate: showRules ? 180 : 0 }} className="text-[10px]">▼</motion.span>
                </button>

                <AnimatePresence initial={false}>
                    {showRules && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-4 pb-4 pt-2">
                                {/* Army Rules */}
                                {armyRules.map(rule => (
                                    <div key={rule.id}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-5 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>
                                            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">Army Rule</h3>
                                        </div>
                                        
                                        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-700/50 flex justify-between items-start gap-4 hover:border-zinc-500 transition shadow-sm">
                                            <div className="min-w-0 space-y-1">
                                                <div className="font-bold text-base text-zinc-100">{rule.name}</div>
                                                <div className="text-sm text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                                                    {rule.description}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setOpenRule({ type: "army", id: rule.id })}
                                                className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded transition shrink-0 border border-zinc-600"
                                            >
                                                Read
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Detachment */}
                                {detachment && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-5 bg-purple-600 rounded-full shadow-[0_0_8px_rgba(147,51,234,0.5)]"></div>
                                            <h3 className="text-lg font-bold text-zinc-100 uppercase tracking-wide">Detachment</h3>
                                        </div>

                                        <div className="bg-zinc-950/60 p-3 rounded-lg border border-zinc-700/50 flex justify-between items-start gap-4 hover:border-purple-500/50 transition shadow-sm">
                                            <div className="min-w-0 space-y-1">
                                                <div className="font-bold text-base text-zinc-100">{detachment.name}</div>
                                                {detachment.rules?.[0] && (
                                                    <div className="text-sm text-zinc-400 line-clamp-3 leading-relaxed whitespace-pre-line">
                                                        {detachment.rules[0].description}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setOpenRule({ type: "detachment", id: detachment.id })}
                                                className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium rounded transition shrink-0 border border-zinc-600"
                                            >
                                                Read
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* --- BOTTOM TABS --- */}
            <div className="flex border-b border-zinc-700 mt-0">
                <button
                    onClick={() => setViewMode("armyList")}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-all relative ${viewMode === "armyList"
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                        }`}
                >
                    Army List
                    {viewMode === "armyList" && (
                        <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)]" />
                    )}
                </button>
                <button
                    onClick={() => setViewMode("datasheet")}
                    className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-all relative ${viewMode === "datasheet"
                            ? "text-white"
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
                        }`}
                >
                    Datasheets
                    {viewMode === "datasheet" && (
                        <motion.span layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.7)]" />
                    )}
                </button>
            </div>
        </section>
    )
}