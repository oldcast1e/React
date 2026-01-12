import { ArrowLeft, Star } from 'lucide-react';

const WorkDetailView = ({ work, onBack }) => {
    if (!work) {
        return (
            <div className="px-4 py-8 text-center">
                <p className="text-gray-500">작품을 찾을 수 없습니다.</p>
            </div>
        );
    }

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, index) => (
            <Star
                key={index}
                size={20}
                className={index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Back Button */}
            <div className="sticky top-16 bg-white border-b border-gray-100 px-4 py-3 z-10">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-700 hover:text-black transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">뒤로</span>
                </button>
            </div>

            {/* Work Image */}
            <div className="w-full aspect-square bg-gray-100">
                <img
                    src={work.thumbnail || work.image}
                    alt={work.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Work Details */}
            <div className="px-4 py-6">
                {/* Title and Date */}
                <h1 className="text-3xl font-bold mb-2">{work.title}</h1>
                <p className="text-gray-500 mb-4">{work.date}</p>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                    {renderStars(work.rating || 0)}
                </div>

                {/* Tags */}
                {work.tags && work.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {work.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Category */}
                {work.category && (
                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">카테고리</h3>
                        <p className="text-base">{work.category}</p>
                    </div>
                )}

                {/* Review/Notes */}
                {work.review && (
                    <div>
                        <h3 className="text-sm font-semibold text-gray-500 mb-2">감상평</h3>
                        <p className="text-base leading-relaxed">{work.review}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkDetailView;
