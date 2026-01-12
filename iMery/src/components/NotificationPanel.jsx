import { X } from 'lucide-react';
import { useEffect } from 'react';

const NotificationPanel = ({ isOpen, onClose }) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Sample notifications
    const notifications = [
        {
            id: 1,
            type: 'work',
            title: '새 작품이 등록되었습니다',
            message: 'Urban Dreams 작품이 성공적으로 저장되었습니다.',
            time: '5분 전',
        },
        {
            id: 2,
            type: 'ad',
            title: '프리미엄 기능 안내',
            message: '무제한 작품 저장과 고급 필터를 사용해보세요.',
            time: '1시간 전',
        },
        {
            id: 3,
            type: 'work',
            title: '작품 저장 완료',
            message: 'Starry Night 작품이 저장되었습니다.',
            time: '2시간 전',
        },
        {
            id: 4,
            type: 'ad',
            title: '새로운 갤러리 오픈',
            message: '현대 미술 특별전이 시작되었습니다.',
            time: '1일 전',
        },
    ];

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sliding Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">알림</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close notifications"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto h-[calc(100%-73px)]">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'work'
                                            ? 'bg-blue-100 text-blue-600'
                                            : 'bg-purple-100 text-purple-600'
                                        }`}
                                >
                                    {notification.type === 'work' ? '🎨' : '📢'}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-semibold text-sm text-black">
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
