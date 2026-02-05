import StoryCard from "../components/StoryCard";
import RankingSidebar from "../components/RankingSidebar";

async function searchStories(query: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        const res = await fetch(`${apiUrl}/stories?q=${encodeURIComponent(query)}&limit=50`, {
            cache: 'no-store' // Don't cache search results
        });
        if (!res.ok) return { data: [], total: 0 };
        return res.json();
    } catch (error) {
        console.error("Search stories failed:", error);
        return { data: [], total: 0 };
    }
}

async function getTopViewed() {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        const res = await fetch(`${apiUrl}/stories?sort_by=view_count&limit=10`, { next: { revalidate: 3600 } });
        if (!res.ok) return { data: [] };
        return res.json();
    } catch (error) {
        return { data: [] };
    }
}

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string }
}) {
    const query = (await searchParams).q || "";
    const { data: stories } = await searchStories(query);
    const { data: topViewed } = await getTopViewed();

    const rankingItems = topViewed.map((s: any) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        view_count: s.view_count || 0
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
            <div className="mb-12">
                <h1 className="text-3xl font-black mb-2">Kết quả tìm kiếm</h1>
                <p className="text-slate-500 text-sm">
                    Tìm thấy <span className="text-emerald-400 font-bold">{stories.length}</span> kết quả cho từ khóa:
                    <span className="italic text-white ml-2">"{query}"</span>
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3">
                    {stories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                            {stories.map((story: any) => (
                                <StoryCard key={story.id} story={story} searchTerm={query} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 glass rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Không tìm thấy truyện</h3>
                            <p className="text-slate-500">Hãy thử tìm với từ khóa khác hoặc kiểm tra lại chính tả.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    <RankingSidebar title="Có thể bạn quan tâm" items={rankingItems} />
                </div>
            </div>
        </div>
    );
}
