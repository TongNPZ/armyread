import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { ParsedRoster } from "../lib/parser/parseRoster"
import type { OpenRule } from "../hooks/useArmyRoster"

interface Props {
    openRule: OpenRule
    setOpenRule: React.Dispatch<React.SetStateAction<OpenRule>>
    armyRules: ParsedRoster['armyRules']
    detachment: ParsedRoster['detachment']
}

export default function RuleModal({ openRule, setOpenRule, armyRules, detachment }: Props) {
    // Custom Scrollbar Styles
    const scrollbarStyle = "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900 hover:scrollbar-thumb-zinc-500"

    return (
        <AnimatePresence>
            {openRule && (
                <motion.div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setOpenRule(null)}
                >
                    <motion.div
                        className="bg-zinc-900 w-full max-w-3xl rounded-xl border border-zinc-700 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        initial={{ scale: 0.95, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.95, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 1. Header (Sticky) */}
                        <div className="flex justify-between items-center p-5 border-b border-zinc-800 bg-zinc-900 sticky top-0 z-10">
                            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                                <span className={`w-2 h-6 rounded-full ${openRule.type === 'detachment' ? 'bg-purple-600' : 'bg-red-600'}`}></span>
                                {openRule.type === 'army' ? 'Army Rule' : 'Detachment Rule'}
                            </h2>
                            <button
                                onClick={() => setOpenRule(null)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* 2. Content (Scrollable) */}
                        <div className={`p-6 overflow-y-auto ${scrollbarStyle}`}>
                            {openRule.type === "army" &&
                                armyRules
                                    .filter(r => r.id === openRule.id)
                                    .map(rule => (
                                        <div key={rule.id} className="space-y-6">
                                            <div>
                                                <h1 className="text-2xl font-black uppercase text-white mb-4 tracking-tight">
                                                    {rule.name}
                                                </h1>
                                                <div className="text-base text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                                                    {rule.description}
                                                </div>
                                            </div>

                                            {rule.references && rule.references.length > 0 && (
                                                <div className="space-y-4 pt-4 border-t border-zinc-800">
                                                    {rule.references.map(ref => (
                                                        <div key={ref.title} className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
                                                            <div className="font-bold text-zinc-200 mb-3 text-lg">{ref.title}</div>
                                                            <div className="space-y-4">
                                                                {ref.rules.map((r, idx) => (
                                                                    <div key={r.id} className="relative pl-4 border-l-2 border-zinc-700">
                                                                        <div className="font-bold text-zinc-200 text-sm mb-1">
                                                                            {r.name}
                                                                        </div>
                                                                        <div className="text-sm text-zinc-400 whitespace-pre-line leading-relaxed">
                                                                            {r.description}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))
                            }

                            {openRule.type === "detachment" && detachment?.rules?.map(rule => (
                                <div key={rule.id} className="space-y-6">
                                    <h1 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                                        {detachment.name}
                                    </h1>
                                    <div className="text-lg font-medium text-zinc-400 border-b border-zinc-800 pb-4 mb-4">
                                        Detachment Rule
                                    </div>
                                    <div className="text-base text-zinc-300 leading-relaxed whitespace-pre-line font-sans">
                                        {rule.description}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 3. Footer (Optional Close) */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900 flex justify-end">
                            <button
                                onClick={() => setOpenRule(null)}
                                className="px-5 py-2 rounded bg-zinc-100 hover:bg-white text-zinc-900 font-bold text-sm transition"
                            >
                                Close
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}