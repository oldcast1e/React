import { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import UploadModal from './components/UploadModal';
import ReviewForm from './components/ReviewForm';
import NotificationPanel from './components/NotificationPanel';
import ScrollToTopButton from './components/ScrollToTopButton';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import HomeView from './components/views/HomeView';
import WorksView from './components/views/WorksView';
import SearchView from './components/views/SearchView';
import MyView from './components/views/MyView';
import WorkDetailView from './components/views/WorkDetailView';
import useLocalStorage from './hooks/useLocalStorage';
import { worksList as initialWorksList } from './data/mockData';

function App() {
  const [toast, setToast] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [reviewFormOpen, setReviewFormOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [works, setWorks] = useLocalStorage('imery-works', initialWorksList);
  const [activeView, setActiveView] = useState('home');

  // New state for features
  const [language, setLanguage] = useState('KO');
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [searchTags, setSearchTags] = useState([]);
  const [folders, setFolders] = useLocalStorage('imery-folders', []);

  // Phase 2 features
  const [editingWork, setEditingWork] = useState(null);
  const [deleteConfirmWork, setDeleteConfirmWork] = useState(null);
  const [bookmarkedIds, setBookmarkedIds] = useLocalStorage('imery-bookmarks', []);
  const [selectedRating, setSelectedRating] = useState('All');
  const [sortBy, setSortBy] = useState('latest');
  const [layout, setLayout] = useState('list');

  // Listen for navigate-to-works event from More button
  useEffect(() => {
    const handleNavigateToWorks = () => {
      setActiveView('works');
      setSelectedWork(null);
    };
    window.addEventListener('navigate-to-works', handleNavigateToWorks);
    return () => window.removeEventListener('navigate-to-works', handleNavigateToWorks);
  }, []);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleImageSelected = (imageData, file) => {
    setCurrentImage(imageData);
    setUploadModalOpen(false);
    setReviewFormOpen(true);
  };

  const handleSaveReview = (newWork) => {
    if (editingWork) {
      // Update existing work
      setWorks(works.map(w => w.id === newWork.id ? newWork : w));
      setEditingWork(null);
      showToast('작품이 수정되었습니다');
    } else {
      // Add new work
      setWorks([newWork, ...works]);
      showToast('작품이 저장되었습니다');
    }
    setReviewFormOpen(false);
    setCurrentImage(null);
  };

  // Edit work
  const handleEditWork = (work) => {
    setEditingWork(work);
    setReviewFormOpen(true);
  };

  // Delete work
  const handleDeleteClick = (work) => {
    setDeleteConfirmWork(work);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmWork) {
      setWorks(works.filter(w => w.id !== deleteConfirmWork.id));
      setDeleteConfirmWork(null);
      showToast('작품이 삭제되었습니다');
    }
  };

  // Bookmark toggle
  const handleBookmarkToggle = (workId) => {
    setBookmarkedIds(prev =>
      prev.includes(workId)
        ? prev.filter(id => id !== workId)
        : [...prev, workId]
    );
  };

  // Navigate to home
  const handleNavigateHome = () => {
    setActiveView('home');
    setSelectedWork(null);
  };

  // Language toggle
  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'KO' ? 'EN' : 'KO');
  };

  // Work detail navigation
  const handleWorkClick = (work) => {
    setSelectedWork(work);
  };

  const handleBackFromDetail = () => {
    setSelectedWork(null);
  };

  // Tag search navigation
  const handleTagClick = (tag) => {
    setSearchTags([tag]);
    setActiveView('search');
  };

  // Bottom nav with clear selection
  const handleViewChange = (view) => {
    setActiveView(view);
    setSelectedWork(null); // Always clear selected work when navigating
  };

  const renderView = () => {
    // Show work detail if a work is selected
    if (selectedWork) {
      return <WorkDetailView work={selectedWork} onBack={handleBackFromDetail} />;
    }

    switch (activeView) {
      case 'home':
        return (
          <HomeView
            works={works}
            onUploadClick={handleUploadClick}
            onWorkClick={handleWorkClick}
            onTagClick={handleTagClick}
            onEditClick={handleEditWork}
            onDeleteClick={handleDeleteClick}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            layout={layout}
            onLayoutChange={setLayout}
          />
        );
      case 'works':
        return (
          <WorksView
            works={works}
            folders={folders}
            setFolders={setFolders}
            onWorkClick={handleWorkClick}
            onEditClick={handleEditWork}
            onDeleteClick={handleDeleteClick}
            bookmarkedIds={bookmarkedIds}
          />
        );
      case 'search':
        return (
          <SearchView
            works={works}
            initialTags={searchTags}
            onTagsChange={setSearchTags}
            onWorkClick={handleWorkClick}
            onEditClick={handleEditWork}
          />
        );
      case 'my':
        return <MyView works={works} />;
      default:
        return (
          <HomeView
            works={works}
            onUploadClick={handleUploadClick}
            onWorkClick={handleWorkClick}
            onTagClick={handleTagClick}
            onEditClick={handleEditWork}
            onDeleteClick={handleDeleteClick}
            bookmarkedIds={bookmarkedIds}
            onBookmarkToggle={handleBookmarkToggle}
            selectedRating={selectedRating}
            onRatingChange={setSelectedRating}
            sortBy={sortBy}
            onSortChange={setSortBy}
            layout={layout}
            onLayoutChange={setLayout}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <Header
        onNavigateHome={handleNavigateHome}
        language={language}
        onLanguageToggle={handleLanguageToggle}
        onNotificationClick={() => setNotificationPanelOpen(true)}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />

      {/* Main Content */}
      <div className="pt-16 pb-20">
        {renderView()}
      </div>

      {/* Bottom Navigation */}
      <BottomNav
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onImageSelected={handleImageSelected}
      />

      {/* Review Form */}
      <ReviewForm
        isOpen={reviewFormOpen}
        onClose={() => {
          setReviewFormOpen(false);
          setCurrentImage(null);
          setEditingWork(null);
        }}
        imageData={currentImage}
        onSave={handleSaveReview}
        existingWork={editingWork}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!deleteConfirmWork}
        onClose={() => setDeleteConfirmWork(null)}
        onConfirm={handleDeleteConfirm}
        workTitle={deleteConfirmWork?.title}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-black text-white px-6 py-3 rounded-full shadow-lg text-sm font-medium">
            {toast}
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}

export default App;
