// app/hooks/useArmyRoster.ts
import { useState, useEffect, useMemo } from "react"
import { get as idbGet, set as idbSet, del as idbDel } from "idb-keyval"
import { parseRoster } from "../lib/parser/parseRoster"
import type { ParsedRoster } from "../lib/parser/parseRoster"
import type { RosterType } from "../lib/parser/roster/rosterImportTypes"
import type { ArmyListUnit } from "../lib/parser/armyList/armyListTypes"
import { CATEGORY_ORDER } from "../lib/parser/armyList/getUnitCategory"

const DB_KEY = "wh40kjr-army-list"

// ✅ Export Types เพื่อให้ Component อื่นนำไปใช้กำหนด Props
export type ViewMode = "armyList" | "datasheet"
export type OpenRule = { type: "army"; id: string } | { type: "detachment"; id: string } | null

export function useArmyRoster() {
    const [isLoaded, setIsLoaded] = useState(false)
    const [parsed, setParsed] = useState<ParsedRoster | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>("armyList")
    const [searchTerm, setSearchTerm] = useState("")
    const [openRule, setOpenRule] = useState<OpenRule>(null)

    // Load Data
    useEffect(() => {
        async function loadData() {
            try {
                const savedData = await idbGet<ParsedRoster>(DB_KEY)
                if (savedData) setParsed(savedData)
            } catch (error) {
                console.error("Failed to load data:", error)
            } finally {
                setIsLoaded(true)
            }
        }
        loadData()
    }, [])

    // Auto Save
    useEffect(() => {
        if (!isLoaded) return
        if (parsed) {
            idbSet(DB_KEY, parsed).catch(console.error)
        }
    }, [parsed, isLoaded])

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string) as RosterType
                const newParsed = parseRoster(json)
                setParsed(newParsed)
                setSearchTerm("")
                if (newParsed) idbSet(DB_KEY, newParsed) // Save immediately
            } catch {
                alert("Invalid JSON file")
            }
        }
        reader.readAsText(file)
    }

    const handleClear = () => {
        setParsed(null)
        setOpenRule(null)
        setSearchTerm("")
        setViewMode("armyList")
        idbDel(DB_KEY)
    }

    // Derived State
    const { units = [] } = parsed || {}

    const groupedUnits = useMemo(() => {
        return units.reduce<Record<string, ArmyListUnit[]>>((acc, unit) => {
            const cat = unit.category ?? "OTHER"
            acc[cat] ??= []
            acc[cat].push(unit)
            return acc
        }, {})
    }, [units])

    const orderedCategories = useMemo(() => {
        return [...CATEGORY_ORDER, ...Object.keys(groupedUnits).filter(c => !CATEGORY_ORDER.includes(c as any))]
    }, [groupedUnits])

    const { featuredUnit, otherUnits } = useMemo(() => {
        if (!parsed || units.length === 0) return { featuredUnit: null, otherUnits: [] }

        if (!searchTerm) {
            return { featuredUnit: units[0], otherUnits: units.slice(1) }
        }

        const foundIndex = units.findIndex(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()))
        if (foundIndex === -1) {
            return { featuredUnit: units[0], otherUnits: units.slice(1) }
        }

        const featured = units[foundIndex]
        const others = units.filter((_, i) => i !== foundIndex)
        return { featuredUnit: featured, otherUnits: others }
    }, [parsed, units, searchTerm])

    return {
        isLoaded,
        parsed,
        viewMode,
        setViewMode, // TypeScript จะรู้ว่านี่คือ Dispatch<SetStateAction<ViewMode>>
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
    }
}