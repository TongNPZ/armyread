// app/components/EmptyState.tsx
export default function EmptyState({ onUpload }: { onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
    return (
        <main className="mx-auto max-w-screen-xl px-6 py-20 text-center bg-zinc-950 text-gray-100 space-y-8">
            <h1 className="text-3xl font-bold">Army List</h1>
            <label className="cursor-pointer border border-zinc-600 bg-zinc-900 px-4 py-2 text-sm hover:bg-zinc-800 inline-block transition hover:border-zinc-400">
                Upload Army List JSON File.
                <input type="file" accept=".json" onChange={onUpload} className="hidden" />
            </label>
            <p className="text-zinc-500 text-xs">Data is saved locally in your browser automatically.</p>
            <div className="mt-8 text-zinc-500 text-sm italic">
                Powered by Wahapedia.
            </div>
        </main>

    )
}