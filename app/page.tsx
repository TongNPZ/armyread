// app/page.tsx
"use client";

import { useArmyRoster } from "./hooks/useArmyRoster";
import EmptyState from "./components/EmptyState";
import ArmyHeader from "./components/ArmyHeader";
import ArmyListView from "./components/ArmyListView";
import DatasheetView from "./components/DatasheetView";
import RuleModal from "./components/RuleModal";
import { motion, AnimatePresence } from "framer-motion";
import { ArmyListUnit } from "./lib/parser/armyList/armyListTypes";

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
    featuredUnit,
    otherUnits,
    units,
  } = useArmyRoster();

  const handleSelectUnit = (unit: ArmyListUnit) => {
    setSearchTerm(unit.name);
    setViewMode("datasheet");
  };

  // 1. Loading State (จับมาไว้ตรงกลางด้วย)
  if (!isLoaded) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-zinc-950 px-6 py-20 text-center text-gray-100">
        <div className="animate-pulse text-zinc-500 text-lg">Loading local data...</div>
      </main>
    );
  }

  // 2. Empty State (จับมาไว้ตรงกลางหน้าจอเป๊ะๆ)
  if (!parsed) {
    return (
      // 🟢 ใช้ flex, items-center และ justify-center เพื่อดัน EmptyState ลงมาตรงกลาง
      <main className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 p-6">
        <div className="w-full max-w-xl">
          <EmptyState onUpload={handleUpload} />
        </div>
      </main>
    );
  }

  // 3. Main Content
  return (
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
              units={units}
              faction={parsed.meta.faction}
              onSelectUnit={handleSelectUnit}
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
              detachmentName={parsed.detachment?.name || ""}
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

      {/* Footer อ้างอิง Wahapedia */}
      <footer className="w-full text-center py-8 mt-12 border-t border-zinc-800/50">
        <p className="text-zinc-500 text-sm flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4 text-zinc-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22l10-10L12 2zM2 12l10 10V2L2 12z" /></svg>
          Powered by <a href="https://wahapedia.ru/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 font-bold hover:text-yellow-500 transition-colors">Wahapedia</a>
        </p>
      </footer>
    </main>
  );
}