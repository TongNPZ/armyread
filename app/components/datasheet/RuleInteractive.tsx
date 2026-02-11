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
                <div className="relative drop-shadow-xl filter">
                    <div
                        className={`absolute -bottom-[5px] w-4 h-4 bg-white border-r border-b border-zinc-200 transform rotate-45 z-0 ${arrowPositionClass}`}
                    ></div>
                    <div className="relative z-10 bg-white border border-zinc-200 p-3.5 shadow-[0_10px_25px_rgba(0,0,0,0.15)] flex flex-col max-h-[250px] sm:max-h-[350px]">
                        <h4
                            className="font-black text-[14px] uppercase tracking-wide border-b-2 border-dotted border-zinc-300 pb-1.5 mb-2 shrink-0"
                            style={color ? { color: color } : { color: "#18181b" }}
                        >
                            {displayName}
                        </h4>
                        <div className="text-[13px] text-zinc-700 leading-relaxed font-normal whitespace-pre-line text-left normal-case overflow-y-auto pr-1">
                            {finalDesc}
                        </div>
                    </div>
                </div>
            </span>
        </span>
    );
}