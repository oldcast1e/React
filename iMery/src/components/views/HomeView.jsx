import HighlightCarousel from '../HighlightCarousel';
import CategoryTabs from '../CategoryTabs';
import ActionBar from '../ActionBar';
import FilterChips from '../FilterChips';
import WorksList from '../WorksList';
import { useMemo } from 'react';

const HomeView = ({
    works,
    onUploadClick,
    onWorkClick,
    onTagClick,
    onEditClick,
    onDeleteClick,
    bookmarkedIds,
    onBookmarkToggle,
    selectedRating,
    onRatingChange,
    sortBy,
    onSortChange,
    layout,
    onLayoutChange
}) => {
    const handleMoreClick = () => {
        window.dispatchEvent(new CustomEvent('navigate-to-works'));
    };

    // Filter and sort works
    const processedWorks = useMemo(() => {
        // Filter by rating
        let filtered = selectedRating === 'All'
            ? works
            : works.filter(work => {
                const ratingNum = parseInt(selectedRating.replace('★', ''));
                return work.rating === ratingNum;
            });

        // Sort
        if (sortBy === 'latest') {
            filtered = [...filtered].sort((a, b) => {
                return new Date(b.date.replace(/\./g, '-')) - new Date(a.date.replace(/\./g, '-'));
            });
        } else if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [works, selectedRating, sortBy]);

    return (
        <>
            {/* Highlight Carousel */}
            <HighlightCarousel
                works={works}
                onWorkClick={onWorkClick}
                onMoreClick={handleMoreClick}
            />

            {/* Category Tabs */}
            <CategoryTabs onTagClick={onTagClick} />

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Action Bar */}
            <ActionBar onUploadClick={onUploadClick} />

            {/* Filter Chips */}
            <FilterChips
                selectedRating={selectedRating}
                onRatingChange={onRatingChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                layout={layout}
                onLayoutChange={onLayoutChange}
            />

            {/* Works List */}
            <WorksList
                works={processedWorks}
                onWorkClick={onWorkClick}
                onTagClick={onTagClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={onBookmarkToggle}
                layout={layout}
            />
        </>
    );
};

export default HomeView;
