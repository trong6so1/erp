import Link from "next/link";
import Image from "next/image";

interface StoryCardProps {
    story: {
        id: number;
        title: string;
        slug: string;
        cover_image: string | null;
        author_obj?: { name: string };
        rating?: number;
        chapter_count?: number;
        categories?: { id: number; name: string; slug: string }[];
    };
    searchTerm?: string;
}

export default function StoryCard({ story, searchTerm }: StoryCardProps) {
    const mainCategory = story.categories?.[0];

    const highlightMatch = (text: string, term?: string) => {
        if (!term) return text;
        const terms = term.trim().split(/\s+/).filter(t => t.length > 0);
        if (terms.length === 0) return text;

        const regex = new RegExp(`(${terms.join('|')})`, 'gi');
        const parts = text.split(regex);

        return (
            <>
                {parts.map((part, i) => {
                    const isMatch = terms.some(t => part.toLowerCase() === t.toLowerCase());
                    return isMatch ? (
                        <span key={i} className="text-red-500 font-bold underline decoration-red-500/30 underline-offset-2">{part}</span>
                    ) : part;
                })}
            </>
        );
    };

    return (
        <div className="group block relative">
            <Link href={`/story/${story.slug}`} className="block">
                <div className="card-hover relative aspect-[3/4] overflow-hidden rounded-xl bg-slate-800 ring-1 ring-white/10">
                    {story.cover_image ? (
                        <img
                            src={story.cover_image}
                            alt={story.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">No Cover</div>
                    )}

                    {/* Overlay for rating/chapter count */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 pt-12">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-emerald-400">
                                {story.chapter_count || 0} chương
                            </span>
                            {story.rating && (
                                <div className="flex items-center gap-1 text-[10px] text-yellow-400">
                                    ★ {story.rating.toFixed(1)}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>

            {/* Category Badge (Top Left) - Outside main Link to avoid nesting */}
            {mainCategory && (
                <div className="absolute top-2 left-2 z-20">
                    <Link
                        href={`/category/${mainCategory.slug}`}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/90 text-[10px] font-bold text-white shadow-lg backdrop-blur-sm uppercase tracking-wider hover:bg-emerald-400 transition-colors"
                    >
                        {mainCategory.name}
                    </Link>
                </div>
            )}

            <div className="mt-3">
                <Link href={`/story/${story.slug}`}>
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground group-hover:text-emerald-400 transition-colors leading-tight">
                        {highlightMatch(story.title, searchTerm)}
                    </h3>
                </Link>
                <p className="mt-1 text-xs text-slate-500 truncate">
                    {story.author_obj?.name || "Ẩn danh"}
                </p>
            </div>
        </div>
    );
}


