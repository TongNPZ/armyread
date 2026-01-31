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
        <section className="border border-zinc-700 bg-zinc-900/80 pt-3 px-4 space-y-3 rounded-t-lg shadow-lg">
            
            {/* --- TOP ROW --- */}
            <div className="flex justify-between items-start">
                <div>
                    <div className="text-zinc-500 uppercase text-[10px] tracking-wider mb-0.5">
                        Faction Keyword
                    </div>
                    <div className="text-xl font-black uppercase tracking-tight text-white leading-none">
                        {meta.faction}
                    </div>
                </div>

                {/* ✅ ปุ่ม Icon ถังขยะ - ปรับให้เด่นขึ้น */}
                <button
                    onClick={() => {
                        if (window.confirm("Are you sure you want to clear all data?")) {
                            onClear()
                        }
                    }}
                    // ปรับ Style ให้เป็นปุ่มโทนแดง มีพื้นหลังและขอบ
                    className="p-2 text-red-500/70 bg-red-950/20 border border-red-900/30 rounded-md hover:bg-red-900/40 hover:text-red-400 hover:border-red-800 transition-all duration-200 shadow-sm"
                    title="Clear All Data"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                </button>
            </div>

            {/* --- STATS ROW --- */}
            <div className="grid grid-cols-3 gap-2 text-sm border-t border-zinc-800 pt-2 pb-1">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-[10px] uppercase mb-0.5">Points</div>
                    <div className="font-mono text-sm">
                        <span className="text-red-500 font-bold">{meta.points.used}</span>
                        <span className="text-zinc-600"> / {meta.points.limit}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-[10px] uppercase mb-0.5">Units</div>
                    <div className="font-mono text-zinc-300 text-sm">{units.length}</div>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="text-zinc-500 text-[10px] uppercase mb-0.5">Warlord</div>
                    <div className="font-bold text-zinc-200 text-sm truncate max-w-[120px] sm:max-w-xs">
                        {warlordUnit?.name ?? "—"}
                    </div>
                </div>
            </div>

            {/* --- COLLAPSIBLE RULES --- */}
            <div className="border-t border-zinc-800 pt-1">
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
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                        >
                            <div className="space-y-3 pb-3 pt-1">
                                {/* Army Rules */}
                                {armyRules.map(rule => (
                                    <div key={rule.id}>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-0.5 h-3 bg-red-600 rounded-full"></div>
                                            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Army Rule</h3>
                                        </div>
                                        
                                        <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-700/50 flex justify-between items-start gap-3 hover:border-zinc-600 transition">
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="font-bold text-sm text-zinc-200">{rule.name}</div>
                                                <div className="text-xs text-zinc-500 line-clamp-2 leading-snug whitespace-pre-line">
                                                    {rule.description}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setOpenRule({ type: "army", id: rule.id })}
                                                className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition shrink-0"
                                            >
                                                Read
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Detachment */}
                                {detachment && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-0.5 h-3 bg-purple-600 rounded-full"></div>
                                            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wide">Detachment</h3>
                                        </div>
                                        <div className="bg-zinc-950/60 p-2.5 rounded border border-zinc-700/50 flex justify-between items-start gap-3 hover:border-zinc-600 transition">
                                            <div className="min-w-0 space-y-0.5">
                                                <div className="font-bold text-sm text-zinc-200">{detachment.name}</div>
                                                {detachment.rules?.[0] && (
                                                    <div className="text-xs text-zinc-500 line-clamp-2 leading-snug whitespace-pre-line">
                                                        {detachment.rules[0].description}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => setOpenRule({ type: "detachment", id: detachment.id })}
                                                className="text-[10px] px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 rounded transition shrink-0"
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
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all relative ${viewMode === "armyList"
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
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide transition-all relative ${viewMode === "datasheet"
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