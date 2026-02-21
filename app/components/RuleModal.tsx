// app/components/RuleModal.tsx
import React, { useEffect } from "react"
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

    // ✅ เพิ่ม useEffect บล็อกนี้เข้าไป เพื่อดักจับปุ่ม ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenRule(null)
            }
        }

        // ถ้า Popup เปิดอยู่ ให้เริ่มดักจับปุ่มกด
        if (openRule) {
            window.addEventListener("keydown", handleKeyDown)
        }

        // คืนค่า (Cleanup) เมื่อ Component ถูกปิด
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [openRule, setOpenRule])

    // 🛑 Helper function สำหรับเช็คว่าเป็นชื่อขยะที่ควรซ่อนไหม 
    const isTrashRuleName = (ruleName: string, detachmentName: string) => {
        if (!ruleName) return true;
        const lowerName = ruleName.toLowerCase().trim();
        const lowerDetachment = (detachmentName || "").toLowerCase().trim();

        return lowerName === "detachment rule" ||
            lowerName === "detachment rules" ||
            lowerName === lowerDetachment;
    };

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

                            {/* --- ARMY RULE --- */}
                            {openRule.type === "army" &&
                                armyRules
                                    .filter(r => r.id === openRule.id)
                                    .map(rule => (
                                        <div key={rule.id} className="space-y-6">
                                            <div>
                                                <h1 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                                                    {rule.name}
                                                </h1>
                                                {/* ✅ ใส่ dark-theme ใน Army Rule หลัก */}
                                                <div
                                                    className="wahapedia-content dark-theme text-base text-zinc-300 leading-relaxed font-sans"
                                                    dangerouslySetInnerHTML={{ __html: rule.description }}
                                                />
                                            </div>

                                            {rule.references && rule.references.length > 0 && (
                                                <div className="space-y-4 pt-4 border-t border-zinc-800">
                                                    {rule.references.map(ref => (
                                                        <div key={ref.title} className="bg-zinc-950/50 p-4 rounded-lg border border-zinc-800/50">
                                                            <div className="font-bold text-zinc-200 mb-3 text-lg">{ref.title}</div>
                                                            <div className="space-y-4">
                                                                {ref.rules.map((r) => (
                                                                    <div key={r.id} className="relative pl-4 border-l-2 border-zinc-700">
                                                                        <div className="font-bold text-zinc-200 text-sm mb-1">
                                                                            {r.name}
                                                                        </div>
                                                                        {/* ✅ ใส่ dark-theme ใน กฎย่อย (References) */}
                                                                        <div
                                                                            className="wahapedia-content dark-theme text-sm text-zinc-400 leading-relaxed"
                                                                            dangerouslySetInnerHTML={{ __html: r.description }}
                                                                        />
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

                            {/* --- DETACHMENT RULE --- */}
                            {openRule.type === "detachment" && detachment && (
                                <div className="space-y-6">
                                    {/* หัวข้อใหญ่แสดงแค่รอบเดียว */}
                                    <div>
                                        <h1 className="text-3xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                                            {detachment.name}
                                        </h1>
                                        <div className="text-lg font-medium text-zinc-400 border-b border-zinc-800 pb-4 mb-4">
                                            Detachment Rule
                                        </div>
                                    </div>

                                    {/* วนลูปโชว์กฎย่อย (กรองชื่อขยะออก) */}
                                    <div className="space-y-8">
                                        {detachment.rules?.map((rule, idx) => {
                                            const isTrash = isTrashRuleName(rule.name, detachment.name || "");

                                            return (
                                                <div key={rule.id || idx} className="space-y-2">
                                                    {/* โชว์ชื่อกฎเฉพาะเมื่อไม่ใช่ขยะ (เช่นโชว์ Questing Tendrils) */}
                                                    {!isTrash && (
                                                        <h3 className="font-bold text-xl text-zinc-200">
                                                            {rule.name}
                                                        </h3>
                                                    )}

                                                    <div
                                                        className="wahapedia-content dark-theme text-base text-zinc-300 leading-relaxed font-sans"
                                                        dangerouslySetInnerHTML={{ __html: rule.description }}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
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