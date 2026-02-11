// app/components/datasheet/DatasheetIcons.tsx
import { GiCrosshair, GiCrossedSwords, GiMineExplosion } from "react-icons/gi";
import { MdShield } from "react-icons/md";

export const RangedIcon = () => (
    <GiCrosshair className="w-5 h-5 inline-block mr-1.5 opacity-90" />
);

export const MeleeIcon = () => (
    <GiCrossedSwords className="w-5 h-5 inline-block mr-1.5 opacity-90" />
);

export const InvulnIcon = () => <MdShield className="w-5 h-5" />;

export const DamagedIcon = () => <GiMineExplosion className="w-5 h-5" />;