import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

const ReviewForm = ({ isOpen, onClose, imageData, onSave, existingWork = null }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '그림',
        rating: 5,
        review: '',
        tags: [],
    });

    const categories = ['그림', '조각', '사진', '판화', '기타'];

    // Populate form when editing existing work
    useEffect(() => {
        if (existingWork) {
            setFormData({
                title: existingWork.title || '',
                category: existingWork.category || '그림',
                rating: existingWork.rating || 5,
                review: existingWork.review || '',
                tags: existingWork.tags || [],
            });
        }
    }, [existingWork]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (existingWork) {
            // Editing existing work - preserve original date and id
            const updatedWork = {
                ...existingWork,
                ...formData,
                // Preserve original creation date
                date: existingWork.date,
                id: existingWork.id,
            };
            onSave(updatedWork);
        } else {
            // Creating new work
            const newWork = {
                id: Date.now(),
                ...formData,
                date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
                thumbnail: imageData,
                image: imageData,
            };
            onSave(newWork);
        }

        onClose();
        // Reset form
        setFormData({
            title: '',
            category: '그림',
            rating: 5,
            review: '',
            tags: [],
        });
    };

    const handleStarClick = (rating) => {
        setFormData({ ...formData, rating });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-2xl bg-white rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">
                        {existingWork ? '작품 수정' : '감상평 작성'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Image Preview */}
                {(imageData || existingWork?.thumbnail) && (
                    <div className="mb-6">
                        <img
                            src={imageData || existingWork?.thumbnail}
                            alt="Uploaded work"
                            className="w-full h-48 object-cover rounded-2xl"
                        />
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">작품 제목</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="작품의 제목을 입력하세요"
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium mb-2">카테고리</label>
                        <div className="flex gap-2 flex-wrap">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category })}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${formData.category === category
                                        ? 'bg-black text-white'
                                        : 'bg-gray-100 text-black hover:bg-gray-200'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium mb-2">평점</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                >
                                    <Star
                                        size={32}
                                        className={`transition-colors ${star <= formData.rating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review */}
                    <div>
                        <label className="block text-sm font-medium mb-2">감상평</label>
                        <textarea
                            value={formData.review}
                            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                            placeholder="작품을 보며 느낀 점을 자유롭게 작성해주세요..."
                            rows={6}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black resize-none"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 bg-gray-100 text-black rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                        >
                            {existingWork ? '수정' : '저장'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
