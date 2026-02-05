import Link from "next/link";

async function getChapter(id: string) {
    try {
        const res = await fetch(`http://backend:8000/api/v1/chapters/${id}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Fetch chapter failed:", error);
        return null;
    }
}

export default async function ReadingPage({ params }: { params: { slug: string, id: string } }) {
    const { slug, id } = await params;
    const chapter = await getChapter(id);

    if (!chapter) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-slate-500">Chương không tồn tại.</p>
                <Link href={`/story/${slug}`} className="mt-8 text-emerald-400 font-bold hover:underline">Quay lại truyện</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950/20">

            {/* Chapter Header / Navigation */}
            <div className="sticky top-16 z-40 glass border-b border-white/5 py-4">
                <div className="max-w-4xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4">
                    <Link href={`/story/${slug}`} className="p-2 hover:bg-white/5 rounded-full transition-colors hidden md:block" title="Quay lại truyện">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div className="min-w-0 text-center flex-grow">
                        <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1 truncate">
                            {chapter.story?.title}
                        </h2>
                        <h1 className="text-sm font-black truncate leading-tight">
                            Chương {chapter.ordering}: {chapter.title}
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/5 rounded-full" title="Cài đặt">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Reading Area */}
            <div className="max-w-4xl mx-auto px-4 md:px-12 py-16">
                <div className="prose prose-invert prose-emerald max-w-none">
                    <div className="text-slate-300 md:text-xl leading-[2] md:leading-[2.2] tracking-wide font-serif whitespace-pre-line text-justify">
                        {chapter.content || "Chương này chưa có nội dung."}
                    </div>
                </div>

                {/* Footer Navigation */}
                <div className="mt-20 pt-12 border-t border-white/5 flex items-center justify-between gap-8">
                    <button
                        className="flex-1 glass hover:bg-white/10 p-5 rounded-2xl flex items-center justify-center gap-4 transition-all border border-white/10 disabled:opacity-20"
                        disabled={chapter.ordering <= 1}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        <span className="font-bold hidden md:block">Chương trước</span>
                    </button>

                    <Link href={`/story/${slug}`} className="glass hover:bg-white/10 p-5 rounded-2xl text-slate-400" title="Mục lục">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>
                    </Link>

                    <button
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white p-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-lg shadow-emerald-500/20"
                    >
                        <span className="font-bold hidden md:block">Chương sau</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                </div>

                <div className="mt-12 text-center text-slate-500 text-xs italic">
                    Cảm ơn bạn đã đọc tại METRUYEN. Chúc bạn có những giây phút thư giãn!
                </div>
            </div>
        </div>
    );
}
