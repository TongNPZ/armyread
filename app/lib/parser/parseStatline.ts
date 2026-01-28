import type { Statline, Profile } from "./types"

export function parseStatline(
    profiles?: Profile[]
): Statline | undefined {
    if (!profiles) return

    const statProfile = profiles.find(
        p => p.typeName === "Statline"
    )
    if (!statProfile?.characteristics) return

    const map = Object.fromEntries(
        statProfile.characteristics.map(c => [c.name, c.value])
    )

    if (!map.M) return

    return {
        M: map.M,
        T: map.T,
        SV: map.SV,
        W: map.W,
        LD: map.LD,
        OC: map.OC,
    }
}
