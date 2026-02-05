import StoryCard from "../../components/StoryCard";
import RankingSidebar from "../../components/RankingSidebar";

async function getStoriesByCategory(slug: string) {
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
        // Using existing stories endpoint with category_slug filter
        const res = await fetch(`${apiUrl}/stories?category_slug=${slug}&limit=50`, { next: { revalidate: 3600 } });
        if (!res.ok) return { data: [], total: 0 };
        return res.json();
    } catch (error) {
        console.error("Fetch stories by category failed:", error);
        return { data: [], total: 0 };
    }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const { data: stories } = await getStoriesByCategory(slug);

    // Mock ranking based on stories for initial display
    const rankingItems = stories.slice(0, 10).map((s: any) => ({
        id: s.id,
        title: s.title,
        slug: s.slug,
        view_count: s.view_count || 0
    }));

    // Decode and format the slug as a fallback name
    const decodedSlug = decodeURIComponent(slug).replace(/-/g, ' ');

    const categoryName = stories.length > 0
        ? stories[0].categories?.find((c: any) => c.slug === slug)?.name || decodedSlug
        : decodedSlug;

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">

            <div className="flex flex-col gap-2 mb-12">
                <h1 className="text-4xl font-black flex items-center gap-4">
                    Thể loại: <span className="text-emerald-400 capitalize">{categoryName}</span>
                </h1>
                <p className="text-slate-500 text-sm">Khám phá thế giới truyện thuộc thể loại {categoryName}.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                {/* Stories List */}
                <div className="lg:col-span-3">
                    {stories.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
                            {stories.map((story: any) => (
                                <StoryCard key={story.id} story={story} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-32 glass rounded-3xl border border-dashed border-white/10">
                            <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-6 text-slate-700">
                                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Chưa có truyện nào</h3>
                            <p className="text-slate-500">Chúng tôi đang cập nhật thêm truyện cho thể loại này. Vui lòng quay lại sau!</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <RankingSidebar title="Xem nhiều nhất" items={rankingItems} />

                    <div className="glass rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
                        <h4 className="font-bold text-sm text-emerald-400">Gợi ý khác</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            Bạn không tìm thấy thứ mình muốn? Hãy thử chuyển sang các thể loại khác hoặc sử dụng thanh tìm kiếm.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
