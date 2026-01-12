import { useState } from 'react';
import { Star, Bookmark, Edit2, Trash2 } from 'lucide-react';

const WorksList = ({
    works = [],
    onWorkClick,
    onTagClick,
    onEditClick,
    onDeleteClick,
    bookmarkedIds = [],
    onBookmarkToggle,
    layout = 'list'
}) => {
    const [visibleCount, setVisibleCount] = useState(5);
    const [hoveredWork, setHoveredWork] = useState(null);

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 5, works.length));
    };

    const visibleWorks = works.slice(0, visibleCount);
    const hasMore = visibleCount < works.length;

    // List layout (current default)
    if (layout === 'list') {
        return (
            <div className="px-4 pb-6">
                <div className="space-y-3">
                    {visibleWorks.map((work) => (
                        <div
                            key={work.id}
                            onMouseEnter={() => setHoveredWork(work.id)}
                            onMouseLeave={() => setHoveredWork(null)}
                            className="relative flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Thumbnail */}
                            <div onClick={() => onWorkClick && onWorkClick(work)}>
                                <img
                                    src={work.thumbnail}
                                    alt={work.title}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                />
                            </div>

                            {/* Content */}
                            <div onClick={() => onWorkClick && onWorkClick(work)} className="flex-grow min-w-0">
                                <h3 className="font-semibold text-black truncate">{work.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{work.date}</p>

                                {/* Tags */}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {work.tags && work.tags.length > 0 ? (
                                        work.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTagClick && onTagClick(tag);
                                                }}
                                                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                                            >
                                                {tag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-gray-400">태그 없음</span>
                                    )}
                                </div>

                                {/* Stars */}
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < work.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons - Right Side */}
                            <div className="flex items-center gap-2">
                                {/* Bookmark Button */}
                                {onBookmarkToggle && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBookmarkToggle(work.id);
                                        }}
                                        className={`p-2 rounded-lg transition-all ${hoveredWork === work.id || bookmarkedIds.includes(work.id)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                            }`}
                                    >
                                        <Bookmark
                                            size={18}
                                            className={bookmarkedIds.includes(work.id) ? 'fill-black text-black' : 'text-gray-400 hover:text-black'}
                                        />
                                    </button>
                                )}

                                {/* Edit Button */}
                                {onEditClick && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditClick(work);
                                        }}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} className="text-gray-600" />
                                    </button>
                                )}

                                {/* Delete Button */}
                                {onDeleteClick && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteClick(work);
                                        }}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} className="text-red-600" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load More Button */}
                {hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                        >
                            더보기 ({works.length - visibleCount}개 더 보기)
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Grid layouts (large, medium, small)
    const getGridCols = () => {
        switch (layout) {
            case 'large': return 'grid-cols-1';
            case 'medium': return 'grid-cols-2';
            case 'small': return 'grid-cols-3';
            default: return 'grid-cols-1';
        }
    };

    return (
        <div className="px-4 pb-6">
            <div className={`grid ${getGridCols()} gap-4`}>
                {visibleWorks.map((work) => (
                    <div
                        key={work.id}
                        onMouseEnter={() => setHoveredWork(work.id)}
                        onMouseLeave={() => setHoveredWork(null)}
                        className="relative group"
                    >
                        <div
                            onClick={() => onWorkClick && onWorkClick(work)}
                            className="relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            <img
                                src={work.thumbnail}
                                alt={work.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Overlay */}
                            <div className="absolute bottom-0 left-0 right-0 glass-overlay p-3">
                                <p className="text-sm font-bold text-black truncate">{work.title}</p>
                                <p className="text-xs text-gray-700">{work.date}</p>

                                {/* Stars */}
                                <div className="flex gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < work.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Bookmark Icon - Top Right */}
                            {onBookmarkToggle && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onBookmarkToggle(work.id);
                                    }}
                                    className={`absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full transition-all ${hoveredWork === work.id || bookmarkedIds.includes(work.id)
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        }`}
                                >
                                    <Bookmark
                                        size={16}
                                        className={bookmarkedIds.includes(work.id) ? 'fill-black text-black' : 'text-gray-600'}
                                    />
                                </button>
                            )}
                        </div>

                        {/* Edit/Delete Buttons Below Card */}
                        {(onEditClick || onDeleteClick) && (
                            <div className="flex gap-2 mt-2">
                                {onEditClick && (
                                    <button
                                        onClick={() => onEditClick(work)}
                                        className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Edit2 size={14} />
                                        수정
                                    </button>
                                )}
                                {onDeleteClick && (
                                    <button
                                        onClick={() => onDeleteClick(work)}
                                        className="flex-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                                    >
                                        <Trash2 size={14} />
                                        삭제
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                    >
                        더보기 ({works.length - visibleCount}개 더 보기)
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorksList;
