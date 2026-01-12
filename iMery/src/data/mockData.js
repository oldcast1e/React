// Mock data for the IMery app
export const recentWorks = [
    {
        id: 1,
        tag: '그림',
        title: 'Starry Night',
        image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop',
    },
    {
        id: 2,
        tag: '조각',
        title: 'Modern Sculpture',
        image: 'https://images.unsplash.com/photo-1578926078530-a2d06f0c4c63?w=400&h=400&fit=crop',
    },
    {
        id: 3,
        tag: '사진',
        title: 'Urban Landscape',
        image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=400&h=400&fit=crop',
    },
    {
        id: 4,
        tag: '판화',
        title: 'Abstract Print',
        image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=400&h=400&fit=crop',
    },
    {
        id: 5,
        tag: '그림',
        title: 'Color Study',
        image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
    },
];

export const worksList = [
    {
        id: 1,
        title: 'The Great Wave',
        date: '2024.01.05',
        tags: ['그림', '일본'],
        rating: 5,
        thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=100&h=100&fit=crop',
    },
    {
        id: 2,
        title: 'Venus de Milo',
        date: '2024.01.03',
        tags: ['조각', '고대'],
        rating: 5,
        thumbnail: 'https://images.unsplash.com/photo-1578926078530-a2d06f0c4c63?w=100&h=100&fit=crop',
    },
    {
        id: 3,
        title: 'Moonlight Sonata',
        date: '2024.01.02',
        tags: ['사진', '야경'],
        rating: 4,
        thumbnail: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=100&h=100&fit=crop',
    },
    {
        id: 4,
        title: 'Botanical Series',
        date: '2023.12.28',
        tags: ['판화', '자연'],
        rating: 4,
        thumbnail: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=100&h=100&fit=crop',
    },
    {
        id: 5,
        title: 'Urban Dreams',
        date: '2023.12.25',
        tags: ['그림', '현대'],
        rating: 3,
        thumbnail: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
    },
    {
        id: 6,
        title: 'Mountain Mist',
        date: '2023.12.20',
        tags: ['사진', '자연'],
        rating: 5,
        thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=100&h=100&fit=crop',
    },
];

export const ratingFilters = ['All', '1★', '2★', '3★', '4★', '5★'];

export const categoryFilters = [
    { id: 'all', label: '전체' },
    { id: 'painting', label: '그림' },
    { id: 'sculpture', label: '조각' },
    { id: 'photo', label: '사진' },
    { id: 'print', label: '판화' },
    { id: 'other', label: '기타' },
];
