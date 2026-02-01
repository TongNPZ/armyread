import React from "react"
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import Datasheet from "./Datasheet"

interface Props {
    searchTerm: string
    setSearchTerm: React.Dispatch<React.SetStateAction<string>>
    featuredUnit: ArmyListUnit | null
    otherUnits: ArmyListUnit[]
    factionName?: string
}

export default function DatasheetView({ searchTerm, setSearchTerm, featuredUnit, otherUnits, factionName }: Props) {
    return (
        <div className="space-y-8 pb-20">
            {/* Search Bar */}
            <div className="sticky top-4 z-30">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search unit name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-4 pl-12 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-lg text-white"
                    />
                    <svg className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Featured Unit (Exact Match) */}
            {featuredUnit && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold text-green-500 uppercase tracking-wide mb-2">Best Match</h3>
                        <Datasheet unit={featuredUnit} faction={factionName} />
                    </div>
                    
                    <div className="p-4 border border-zinc-800 bg-zinc-900/50 rounded text-center text-zinc-500 text-sm italic mb-8">
                        Stratagems for {featuredUnit.name} will appear here.
                    </div>
                </div>
            )}

            {/* Other Units / All Units List */}
            {otherUnits.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <h3 className="text-xl font-bold text-zinc-400 uppercase tracking-wide">
                        {featuredUnit ? "Other Units" : "All Units"}
                    </h3>
                    
                    {/* ✅ CHANGED: ใช้ Flex Column เพื่อเรียงเป็น Row ยาวลงมา */}
                    <div className="flex flex-col gap-8">
                        {otherUnits.map(unit => (
                            <div key={unit.id} className="w-full">
                                <Datasheet 
                                    unit={unit} 
                                    faction={factionName} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!featuredUnit && otherUnits.length === 0 && (
                <div className="text-center py-20 text-zinc-500">
                    No units found matching "{searchTerm}"
                </div>
            )}
        </div>
    )
}