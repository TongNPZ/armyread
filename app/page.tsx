"use client"

import { useArmyRoster } from "./hooks/useArmyRoster"
import EmptyState from "./components/EmptyState"
import ArmyHeader from "./components/ArmyHeader"
import ArmyListView from "./components/ArmyListView"
import DatasheetView from "./components/DatasheetView"
import RuleModal from "./components/RuleModal"
import { motion, AnimatePresence } from "framer-motion"

export default function Page() {
    const {
        isLoaded,
        parsed,
        viewMode,
        setViewMode,
        searchTerm,
        setSearchTerm,
        openRule,
        setOpenRule,
        handleUpload,
        handleClear,
        groupedUnits,
        orderedCategories,
        featuredUnit,
        otherUnits,
        units
    } = useArmyRoster()

    // 1. Loading State
    if (!isLoaded) {
        return (
            <main className="mx-auto max-w-screen-xl px-6 py-20 text-center bg-zinc-950 text-gray-100">
                <div className="animate-pulse text-zinc-500">Loading local data...</div>
            </main>
        )
    }

    // 2. Empty State (No Data)
    if (!parsed) {
        return <EmptyState onUpload={handleUpload} />
    }

    // 3. Main Content
    return (
        // ✅ ปรับ Container:
        // - max-w-screen-2xl : จำกัดความกว้างไม่ให้ยืดจนสุดจอเกินไป (ประมาณ 1536px)
        // - px-4 md:px-8 : เพิ่มขอบซ้ายขวาให้ดูสบายตาขึ้น
        // - py-6 : ขยับลงมาจากขอบบนเล็กน้อยเพื่อให้ดูสมดุล
        <main className="mx-auto w-full max-w-screen-2xl px-4 md:px-8 py-6 space-y-6 bg-zinc-950 text-gray-100 min-h-screen">

            {/* Header Section */}
            <ArmyHeader
                meta={parsed.meta}
                units={units}
                armyRules={parsed.armyRules}
                detachment={parsed.detachment}
                viewMode={viewMode}
                setViewMode={setViewMode}
                onClear={handleClear}
                setOpenRule={setOpenRule}
            />

            {/* Content Switcher with Motion */}
            <AnimatePresence mode="wait">
                {viewMode === "armyList" ? (
                    <motion.div
                        key="armyList"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ArmyListView
                            orderedCategories={orderedCategories}
                            groupedUnits={groupedUnits}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="datasheet"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="w-full"
                    >
                        <DatasheetView
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            featuredUnit={featuredUnit}
                            otherUnits={otherUnits}
                            factionName={parsed.meta.faction}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <RuleModal
                openRule={openRule}
                setOpenRule={setOpenRule}
                armyRules={parsed.armyRules}
                detachment={parsed.detachment}
            />
        </main>
    )
}