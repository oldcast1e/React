import { ChevronRight } from 'lucide-react';

const HighlightCarousel = ({ works = [], onWorkClick, onMoreClick }) => {
    // Show only the 5 most recent works
    const recentWorks = works.slice(0, 5);

    return (
        <section className="mb-6">
            {/* Section Header */}
            <div className="flex items-baseline gap-2 mb-4 px-4">
                <h2 className="text-2xl font-bold">저장된 작품</h2>
                <span className="text-sm text-gray-500">목록</span>
            </div>

            {/* Carousel */}
            <div className="overflow-x-auto horizontal-scroll px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {recentWorks.map((work) => (
                        <div
                            key={work.id}
                            onClick={() => onWorkClick(work)}
                            className="relative w-48 h-48 rounded-2xl overflow-hidden flex-shrink-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Background Image */}
                            <img
                                src={work.thumbnail || work.image}
                                alt={work.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Glassmorphism Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 glass-overlay p-3">
                                <p className="text-xs text-gray-700">[{work.category || work.tag}]</p>
                                <p className="text-sm font-bold text-black mt-0.5">{work.title}</p>
                            </div>
                        </div>
                    ))}

                    {/* More Button */}
                    {works.length > 5 && (
                        <div
                            onClick={onMoreClick}
                            className="w-48 h-48 rounded-2xl bg-gray-100 flex-shrink-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            <ChevronRight size={32} className="text-gray-600" />
                            <p className="font-semibold text-gray-700">더보기</p>
                            <p className="text-xs text-gray-500">{works.length - 5}개 더 보기</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HighlightCarousel;
