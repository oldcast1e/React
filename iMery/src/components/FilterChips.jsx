import { useState } from 'react';
import { ratingFilters } from '../data/mockData';
import { ArrowDownUp, SortAsc, List, LayoutGrid, Grid2X2, Grid3X3 } from 'lucide-react';

const FilterChips = ({
    selectedRating,
    onRatingChange,
    sortBy,
    onSortChange,
    layout,
    onLayoutChange
}) => {
    const handleSortToggle = () => {
        onSortChange(sortBy === 'latest' ? 'name' : 'latest');
    };

    const handleLayoutCycle = () => {
        const layouts = ['list', 'large', 'medium', 'small'];
        const currentIndex = layouts.indexOf(layout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        onLayoutChange(layouts[nextIndex]);
    };

    const getLayoutIcon = () => {
        switch (layout) {
            case 'list':
                return <List size={20} />;
            case 'large':
                return <LayoutGrid size={20} />;
            case 'medium':
                return <Grid2X2 size={20} />;
            case 'small':
                return <Grid3X3 size={20} />;
            default:
                return <List size={20} />;
        }
    };

    return (
        <div className="mb-5 px-4">
            <div className="flex items-center gap-3">
                {/* Rating Filter Buttons with Shared Background */}
                <div className="flex-grow bg-gray-50 rounded-2xl p-2">
                    <div className="overflow-x-auto horizontal-scroll">
                        <div className="flex gap-2" style={{ width: 'max-content' }}>
                            {ratingFilters.map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => onRatingChange(filter)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedRating === filter
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-gray-100 border border-gray-200'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sort Icon Button */}
                <button
                    onClick={handleSortToggle}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                    title={sortBy === 'latest' ? '최신순' : '이름순'}
                >
                    {sortBy === 'latest' ? <ArrowDownUp size={20} /> : <SortAsc size={20} />}
                </button>

                {/* Layout Icon Button */}
                <button
                    onClick={handleLayoutCycle}
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex-shrink-0"
                    title={`레이아웃: ${layout}`}
                >
                    {getLayoutIcon()}
                </button>
            </div>
        </div>
    );
};

export default FilterChips;
