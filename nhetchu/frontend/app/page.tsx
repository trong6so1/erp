import Link from "next/link";
import StoryCard from "./components/StoryCard";
import RankingSidebar from "./components/RankingSidebar";
import FeaturedCarousel from "./components/FeaturedCarousel";

async function getStories(sortBy: string = "updated_at", limit: number = 20) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
    const res = await fetch(`${apiUrl}/stories?sort_by=${sortBy}&limit=${limit}`, { next: { revalidate: 3600 } });
    if (!res.ok) return { data: [], total: 0 };
    return res.json();
  } catch (error) {
    console.error(`Fetch stories (${sortBy}) failed:`, error);
    return { data: [], total: 0 };
  }
}

export default async function Home() {
  // Fetch data in parallel
  const [updatedRes, topViewedRes, topRatingRes] = await Promise.all([
    getStories("updated_at", 10),
    getStories("view_count", 10),
    getStories("rating", 10)
  ]);

  const stories = updatedRes.data || [];
  const topViewed = topViewedRes.data || [];
  const topRated = topRatingRes.data || [];

  // Ranking Sidebar uses Top Viewed
  const rankingItems = topViewed.slice(0, 10).map((s: any) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    view_count: s.view_count || 0
  }));

  const featuredStories = topViewed.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">

      {/* Hero / Featured Section */}
      <FeaturedCarousel stories={featuredStories} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

        {/* Left Column: Story Sections */}
        <div className="lg:col-span-3 space-y-20">

          {/* Top Viewed Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                Top Xem Nhiều
              </h2>
              <Link href="/ranking?sort=view_count" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {topViewed.map((story: any) => (
                <StoryCard key={`view-${story.id}`} story={story} />
              ))}
            </div>
          </section>

          {/* Top Rated Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-2 h-8 bg-amber-500 rounded-full"></span>
                Đánh Giá Cao
              </h2>
              <Link href="/ranking?sort=rating" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {topRated.map((story: any) => (
                <StoryCard key={`rate-${story.id}`} story={story} />
              ))}
            </div>
          </section>

          {/* New Updates Section */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
                Mới Cập Nhật
              </h2>
              <Link href="/ranking?sort=updated_at" className="text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">Xem tất cả</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {stories.map((story: any) => (
                <StoryCard key={`new-${story.id}`} story={story} />
              ))}
            </div>
          </section>

          {stories.length === 0 && (
            <div className="text-center py-20 glass rounded-3xl border border-dashed border-white/10">
              <p className="text-slate-500">Đang tải dữ liệu hoặc chưa có truyện nào...</p>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          <RankingSidebar title="Bảng Xếp Hạng" items={rankingItems} />

          <div className="glass rounded-2xl border border-white/10 p-6 flex flex-col gap-4">
            <h4 className="font-bold text-sm text-emerald-400">Thông báo</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hệ thống đang trong quá trình thử nghiệm. Dữ liệu sẽ được cập nhật liên tục từ nguồn MetruyenCV.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}


