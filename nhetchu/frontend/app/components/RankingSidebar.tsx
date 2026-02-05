import Link from "next/link";

interface RankingItem {
    id: number;
    title: string;
    slug: string;
    view_count: number;
}

interface RankingSidebarProps {
    title: string;
    items: RankingItem[];
}

export default function RankingSidebar({ title, items }: RankingSidebarProps) {
    return (
        <div className="glass rounded-2xl border border-white/10 p-5">
            <h2 className="text-lg font-bold mb-6 flex items-center justify-between">
                {title}
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </h2>
            <div className="space-y-4">
                {items.map((item, index) => (
                    <Link
                        key={item.id}
                        href={`/story/${item.slug}`}
                        className="flex items-start gap-4 group"
                    >
                        <span className={`text-xl font-black ${index < 3 ? 'text-emerald-500' : 'text-slate-600'} italic w-6 flex-shrink-0`}>
                            {index + 1}
                        </span>
                        <div className="min-w-0">
                            <h4 className="text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors leading-tight">
                                {item.title}
                            </h4>
                            <span className="text-[10px] text-slate-500">
                                {item.view_count.toLocaleString()} lượt đọc
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
