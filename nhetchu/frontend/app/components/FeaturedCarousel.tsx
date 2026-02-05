"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface FeaturedCarouselProps {
    stories: any[];
}

export default function FeaturedCarousel({ stories }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % stories.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + stories.length) % stories.length);
    };

    // Auto-slide every 8 seconds
    useEffect(() => {
        const timer = setInterval(nextSlide, 8000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    if (!stories.length) return null;

    return (
        <section className="mb-12 relative overflow-hidden rounded-3xl aspect-[21/9] md:aspect-[3/1] group ring-1 ring-white/10 shadow-2xl">
            {stories.map((story, index) => (
                <div
                    key={story.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    <img
                        src={story.cover_image || "/placeholder.jpg"}
                        alt={story.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent flex items-center p-8 md:p-16">
                        <div className={`max-w-xl transition-all duration-700 transform ${index === currentIndex ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold mb-4 border border-emerald-500/20 uppercase tracking-widest">
                                Truyện HOT tuần • {index + 1}/{stories.length}
                            </span>
                            <h2 className="text-2xl md:text-5xl font-black mb-4 leading-tight">
                                {story.title}
                            </h2>
                            <p className="text-slate-300 text-xs md:text-base line-clamp-2 md:line-clamp-3 mb-8 leading-relaxed">
                                {story.description}
                            </p>
                            <div className="flex gap-4">
                                <Link href={`/story/${story.slug}`} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 md:px-10 py-2.5 md:py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 text-sm md:text-base whitespace-nowrap">
                                    Đọc ngay
                                </Link>
                                <Link href={`/story/${story.slug}`} className="bg-white/10 hover:bg-white/20 text-white px-6 md:px-10 py-2.5 md:py-3.5 rounded-xl font-bold transition-all border border-white/10 backdrop-blur-md text-sm md:text-base whitespace-nowrap">
                                    Chi tiết
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full glass hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all border border-white/5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 md:p-3 rounded-full glass hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all border border-white/5"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {stories.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`h-1.5 transition-all rounded-full ${index === currentIndex ? "w-8 bg-emerald-500" : "w-2 bg-white/30 hover:bg-white/50"
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}
