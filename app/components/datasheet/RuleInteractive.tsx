// app/components/datasheet/RuleInteractive.tsx
import React from "react";

interface RuleInteractiveProps {
    name: string;
    description?: string;
    color?: string;
    isWeaponRule?: boolean;
    onClick: (name: string, desc: string) => void;
    ruleMap: Record<string, string>;
}

export default function RuleInteractive({
    name,
    description,
    color,
    isWeaponRule,
    onClick,
    ruleMap,
}: RuleInteractiveProps) {
    const displayName = name.replace(/^\[|\]$/g, "").trim();

    let finalDesc = description;
    if (!finalDesc || finalDesc === "-" || finalDesc.length < 5) {
        if (ruleMap[displayName]) {
            finalDesc = ruleMap[displayName];
        } else {
            const key = Object.keys(ruleMap).find(
                (k) =>
                    displayName.toLowerCase().startsWith(k.toLowerCase()) ||
                    k.toLowerCase().startsWith(displayName.toLowerCase()),
            );
            if (key) finalDesc = ruleMap[key];
        }
    }

    if (!finalDesc) finalDesc = "Description not found in roster.";

    const tooltipPositionClass = isWeaponRule ? "left-0" : "left-1/2 -translate-x-1/2";
    const arrowPositionClass = isWeaponRule ? "left-[20px]" : "left-1/2 -translate-x-1/2";

    // ✅ นำ Custom Scrollbar แบบเดียวกับ RuleModal มาใช้
    const scrollbarStyle = "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-zinc-900 hover:scrollbar-thumb-zinc-500";

    return (
        <span
            className={`group relative cursor-help inline-block transition-colors duration-200
                ${isWeaponRule ? "" : "border-b border-dotted border-zinc-500 hover:border-zinc-800"}
            `}
            onClick={(e) => {
                e.stopPropagation();
                onClick(displayName, finalDesc!);
            }}
        >
            <span
                className={`font-bold transition-colors ${isWeaponRule
                    ? "text-[11px] uppercase group-hover:opacity-80"
                    : "text-[13px] font-bold uppercase text-zinc-700 group-hover:text-black"
                    }`}
                style={color && isWeaponRule ? { color: color } : {}}
            >
                {isWeaponRule ? displayName : displayName}
            </span>

            <span
                className={`absolute bottom-full mb-1 w-[280px] sm:w-[320px] pb-[12px] z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 cursor-auto ${tooltipPositionClass}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative drop-shadow-2xl filter">
                    <div
                        className={`absolute -bottom-[5px] w-4 h-4 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45 z-0 ${arrowPositionClass}`}
                    >
                        
                    </div>
                    
                    {/* ✅ คอนเทนเนอร์หลัก (ดีไซน์เดียวกับ RuleModal) */}
                    <div className="relative z-10 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl flex flex-col max-h-[250px] sm:max-h-[350px] overflow-hidden">
                        
                        {/* ✅ Header แบบเต็มขอบ (มีแถบสีนำหน้า) */}
                        <div className="flex items-center gap-2 p-3 border-b border-zinc-800 bg-zinc-900 shrink-0">
                            <span className={`w-1.5 h-4 rounded-full ${isWeaponRule ? 'bg-orange-500' : 'bg-red-600'}`}></span>
                            <h4
                                className="font-black text-[14px] uppercase tracking-wide"
                                style={color ? { color: color } : { color: "#f4f4f5" }}
                            >
                                {displayName}
                            </h4>
                        </div>
                        
                        {/* ✅ Content พื้นที่แยกที่มี Scrollbar หรูหรา */}
                        <div
                            className={`p-4 wahapedia-content dark-theme text-[13px] text-zinc-300 leading-relaxed font-normal text-left normal-case overflow-y-auto ${scrollbarStyle}`}
                            dangerouslySetInnerHTML={{ __html: finalDesc }}
                        />
                    </div>
                </div>
            </span>
        </span>
    );
}