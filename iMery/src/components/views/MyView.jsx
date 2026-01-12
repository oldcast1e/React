import { User, Star, ImageIcon, Settings } from 'lucide-react';

const MyView = ({ works }) => {
    const totalWorks = works.length;
    const averageRating = works.length > 0
        ? (works.reduce((sum, work) => sum + work.rating, 0) / works.length).toFixed(1)
        : 0;

    return (
        <div className="px-4 pb-6">
            {/* Profile Header */}
            <div className="flex flex-col items-center py-8 mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <User size={48} className="text-gray-500" />
                </div>
                <h2 className="text-xl font-bold">사용자</h2>
                <p className="text-sm text-gray-500 mt-1">art@imery.com</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <ImageIcon size={32} className="mx-auto mb-2 text-gray-700" />
                    <p className="text-2xl font-bold">{totalWorks}</p>
                    <p className="text-sm text-gray-600 mt-1">저장된 작품</p>
                </div>
                <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <Star size={32} className="mx-auto mb-2 text-yellow-400 fill-yellow-400" />
                    <p className="text-2xl font-bold">{averageRating}</p>
                    <p className="text-sm text-gray-600 mt-1">평균 별점</p>
                </div>
            </div>

            {/* Menu Items */}
            <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <Settings size={20} />
                        <span className="font-medium">설정</span>
                    </div>
                    <span className="text-gray-400">›</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3">
                        <User size={20} />
                        <span className="font-medium">프로필 편집</span>
                    </div>
                    <span className="text-gray-400">›</span>
                </button>
            </div>
        </div>
    );
};

export default MyView;
