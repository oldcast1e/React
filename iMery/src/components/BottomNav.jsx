import { Home, Grid3x3, Search, Users, User } from 'lucide-react';

const BottomNav = ({ onToast, activeView, onViewChange }) => {
    const navItems = [
        { id: 'home', label: '홈', icon: Home },
        { id: 'works', label: '작품', icon: Grid3x3 },
        { id: 'search', label: '검색', icon: Search },
        { id: 'community', label: '커뮤니티', icon: Users },
        { id: 'my', label: '마이', icon: User },
    ];

    const handleNavClick = (id) => {
        if (id === 'community') {
            onToast('준비 중인 기능입니다');
        } else {
            onViewChange(id);
        }
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
            <div className="flex justify-around items-center py-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.id)}
                            className="flex flex-col items-center gap-1 py-1 px-3 min-w-[60px]"
                        >
                            <Icon
                                size={22}
                                className={isActive ? 'nav-active' : 'nav-inactive'}
                            />
                            <span
                                className={`text-xs ${isActive ? 'nav-active font-medium' : 'nav-inactive'}`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
