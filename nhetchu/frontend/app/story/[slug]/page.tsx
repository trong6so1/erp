import Link from "next/link";
import { Metadata } from "next";

async function getStory(slug: string) {
    try {
        const res = await fetch(`http://backend:8000/api/v1/stories/${slug}`, { next: { revalidate: 3600 } });
        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.error("Fetch story failed:", error);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const { slug } = await params;
    const story = await getStory(slug);
    if (!story) return { title: "Không tìm thấy truyện" };

    return {
        title: `${story.title} - Đọc truyện online tại METRUYEN`,
        description: story.description?.slice(0, 160),
        openGraph: {
            images: [story.cover_image || ""],
        },
    };
}

export default async function StoryDetail({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const story = await getStory(slug);


    if (!story) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-4xl font-bold mb-4">404</h1>
                <p className="text-slate-500">Truyện không tồn tại hoặc đã bị xóa.</p>
                <Link href="/" className="mt-8 text-emerald-400 font-bold hover:underline">Quay lại trang chủ</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 lg:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">

                {/* Left: Info & Cover */}
                <div className="lg:col-span-3 space-y-12">
                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="w-full md:w-64 flex-shrink-0">
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-white/10 shadow-2xl">
                                <img
                                    src={story.cover_image || "/placeholder.jpg"}
                                    alt={story.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-4">
                                {story.categories?.map((cat: any) => (
                                    <Link
                                        key={cat.id}
                                        href={`/category/${cat.slug}`}
                                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                                    >
                                        {cat.name}
                                    </Link>
                                ))}
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {story.status}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{story.title}</h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-8 pb-8 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Tác giả:</span>
                                    <span className="text-white font-medium">{story.author_obj?.name || "Đang cập nhật"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Đánh giá:</span>
                                    <span className="text-yellow-400 font-bold">★ {story.rating?.toFixed(1) || "5.0"}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500">Số chương:</span>
                                    <span className="text-white font-medium">{story.chapter_count}</span>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-12">
                                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20">
                                    Đọc từ đầu
                                </button>
                                <button className="glass hover:bg-white/10 text-white p-3.5 rounded-xl transition-all border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                </button>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    Giới thiệu
                                    <span className="h-1 w-8 rounded-full bg-emerald-500/50"></span>
                                </h3>
                                <p className="text-slate-400 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                    {story.description || "Chưa có giới thiệu cho truyện này."}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Chapter List */}
                    <div className="pt-12">
                        <h3 className="text-2xl font-black mb-8 flex items-center justify-between">
                            Danh sách chương
                            <span className="text-sm font-normal text-slate-500">{story.chapters?.length || 0} chương</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {story.chapters?.length > 0 ? (
                                story.chapters.sort((a: any, b: any) => a.ordering - b.ordering).map((chap: any) => (
                                    <Link
                                        key={chap.id}
                                        href={`/story/${story.slug}/${chap.id}`}
                                        className="group flex items-center gap-4 p-4 rounded-xl glass border border-white/5 hover:border-emerald-400/30 transition-all"
                                    >
                                        <span className="text-xs font-black text-slate-600 group-hover:text-emerald-500 transition-colors w-12 italic">
                                            {chap.ordering.toString().padStart(2, '0')}
                                        </span>
                                        <span className="text-sm font-bold truncate group-hover:text-emerald-400 transition-colors">
                                            {chap.title}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <div className="md:col-span-2 text-center py-12 glass rounded-2xl border border-dashed border-white/10">
                                    <p className="text-slate-500">Chưa có chương nào được cập nhật.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Sidebar: Meta or Suggestions */}
                <div className="space-y-8">
                    <div className="glass rounded-2xl border border-white/10 p-6">
                        <h4 className="font-bold mb-4 text-emerald-400">Thống kê</h4>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Lượt đọc</span>
                                <span className="font-bold">{story.view_count?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Số chữ</span>
                                <span className="font-bold">{story.word_count?.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500">Đề cử</span>
                                <span className="font-bold">{story.vote_count?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
