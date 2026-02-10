// app/page.tsx
"use client";

import { useArmyRoster } from "./hooks/useArmyRoster";
import EmptyState from "./components/EmptyState";
import ArmyHeader from "./components/ArmyHeader";
import ArmyListView from "./components/ArmyListView";
import DatasheetView from "./components/DatasheetView";
import RuleModal from "./components/RuleModal";
import { motion, AnimatePresence } from "framer-motion";
import { ArmyListUnit } from "./lib/parser/armyList/armyListTypes"; // ✅ เพิ่ม Import Type

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
    // groupedUnits, // ❌ ไม่ต้องใช้แล้ว (ArmyListView จัดการเอง)
    // orderedCategories, // ❌ ไม่ต้องใช้แล้ว
    featuredUnit,
    otherUnits,
    units, // ✅ ใช้ตัวนี้ส่งให้ ArmyListView
  } = useArmyRoster();

  // ✅ เพิ่มฟังก์ชันนี้: เมื่อเลือก Unit จากหน้า List ให้ไปเปิด Datasheet
  const handleSelectUnit = (unit: ArmyListUnit) => {
    setSearchTerm(unit.name); // ตั้งค่าคำค้นหาเป็นชื่อ Unit
    setViewMode("datasheet"); // เปลี่ยนหน้าเป็น Datasheet
  };

  // 1. Loading State
  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-screen-xl px-6 py-20 text-center bg-zinc-950 text-gray-100">
        <div className="animate-pulse text-zinc-500">Loading local data...</div>
      </main>
    );
  }

  // 2. Empty State (No Data)
  if (!parsed) {
    return <EmptyState onUpload={handleUpload} />;
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
            {/* ✅ แก้ไขการเรียกใช้ ArmyListView ให้ถูกต้อง */}
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
  );
}
