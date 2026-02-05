"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Navbar() {
    const [q, setQ] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (q.trim()) {
            router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }
    };

    return (
        <nav className="sticky top-0 z-50 glass border-b border-white/10 px-4 md:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-8">
                <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    METRUYEN
                </Link>
                <div className="hidden md:flex items-center gap-6 text-sm font-medium">
                    <Link href="/genres" className="hover:text-emerald-400 transition-colors">Thể loại</Link>
                    <Link href="/ranking" className="hover:text-emerald-400 transition-colors">Bảng xếp hạng</Link>
                    <Link href="/new" className="hover:text-emerald-400 transition-colors">Truyện mới</Link>
                    <Link href="/full" className="hover:text-emerald-400 transition-colors">Truyện Full</Link>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="Tìm truyện..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="hidden md:block bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm focus:outline-none focus:border-emerald-400/50 transition-all w-64"
                    />
                </form>
                <button className="md:hidden p-2 text-foreground/80">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                </button>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all">
                    Đăng nhập
                </button>
            </div>
        </nav>
    );
}

