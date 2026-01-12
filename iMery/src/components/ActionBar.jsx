import { Search, Bookmark, Plus } from 'lucide-react';

const ActionBar = ({ onUploadClick }) => {
    return (
        <div className="flex items-center gap-3 mb-5 px-4">
            {/* Search Input */}
            <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Search title..."
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-all"
                />
            </div>

            {/* Bookmark Button */}
            <button className="p-2.5 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors">
                <Bookmark size={22} />
            </button>

            {/* Add Button - Primary Action */}
            <button
                onClick={onUploadClick}
                className="p-2.5 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors shadow-md"
            >
                <Plus size={22} />
            </button>
        </div>
    );
};

export default ActionBar;
