import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import FolderCard from '../FolderCard';
import FolderCreationDialog from '../FolderCreationDialog';

const WorksView = ({ works, folders, setFolders, onWorkClick, onEditClick, onDeleteClick, bookmarkedIds = [] }) => {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const handleSaveFolder = (newFolder) => {
        setFolders([...folders, newFolder]);
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
    };

    // Get works for current folder
    const displayedWorks = selectedFolder
        ? works.filter(work => selectedFolder.workIds?.includes(work.id))
        : works;

    // Bookmarked works
    const bookmarkedWorks = works.filter(work => bookmarkedIds.includes(work.id));

    if (selectedFolder) {
        // Show folder contents
        return (
            <div className="px-4">
                {/* Back to folders */}
                <button
                    onClick={() => setSelectedFolder(null)}
                    className="mb-6 text-gray-600 hover:text-black transition-colors"
                >
                    ← 폴더로 돌아가기
                </button>

                <h2 className="text-2xl font-bold mb-6">{selectedFolder.name}</h2>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-4 pb-6">
                    {displayedWorks.map((work) => (
                        <div key={work.id} className="relative">
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
                                </div>
                            </div>

                            {/* Edit/Delete Buttons */}
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
            </div>
        );
    }

    // Show folder list
    return (
        <div className="px-4">
            <h2 className="text-2xl font-bold mb-6">작품 폴더</h2>

            {/* Folder Grid */}
            <div className="grid grid-cols-2 gap-4 pb-6">
                {/* All Works Folder */}
                <div
                    onClick={() => handleFolderClick({ name: '전체 작품', workIds: works.map(w => w.id) })}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-100 to-purple-100"
                >
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <h3 className="font-bold text-lg text-black mb-1">전체 작품</h3>
                            <p className="text-sm text-gray-700">{works.length}개의 작품</p>
                        </div>
                    </div>
                </div>

                {/* Bookmarks Folder */}
                <div
                    onClick={() => handleFolderClick({ name: '북마크', workIds: bookmarkedIds })}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-100 to-orange-100"
                >
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🔖</div>
                            <h3 className="font-bold text-lg text-black mb-1">북마크</h3>
                            <p className="text-sm text-gray-700">{bookmarkedWorks.length}개의 작품</p>
                        </div>
                    </div>
                </div>

                {/* Custom Folders */}
                {folders.map((folder) => (
                    <FolderCard
                        key={folder.id}
                        folder={folder}
                        onFolderClick={handleFolderClick}
                    />
                ))}

                {/* New Folder Button */}
                <div
                    onClick={() => setIsCreatingFolder(true)}
                    className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                    <div className="text-center">
                        <Plus size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-gray-600">새 폴더</p>
                    </div>
                </div>
            </div>

            {/* Folder Creation Dialog */}
            <FolderCreationDialog
                isOpen={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                works={works}
                onSave={handleSaveFolder}
            />
        </div>
    );
};

export default WorksView;
