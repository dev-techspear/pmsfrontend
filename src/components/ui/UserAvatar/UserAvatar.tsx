import React from 'react';

const AVATAR_COLORS = [
    '#04436E', '#2F833A', '#068799', '#032D5E', '#1F6B2E',
    '#04707F', '#5B6B7C', '#0B1F33', '#166534', '#0284C7',
    '#0F766E', '#1E40AF', '#374151', '#15803D', '#0369A1',
];

function getColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

interface UserAvatarProps {
    firstName?: string | null;
    lastName?: string | null;
    imageUrl?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-8 h-8 text-[13px]',
    lg: 'w-10 h-10 text-[15px]',
};

export function UserAvatar({ firstName, lastName, imageUrl, size = 'md', className = '' }: UserAvatarProps) {
    const initials = `${(firstName || '?')[0]}${(lastName || '')[0] || ''}`.toUpperCase();
    const bgColor = getColorFromName(`${firstName || ''}${lastName || ''}`);

    if (imageUrl) {
        return (
            <img
                src={imageUrl}
                alt={`${firstName || ''} ${lastName || ''}`}
                className={`rounded-full object-cover flex-shrink-0 ${sizeClasses[size]} ${className}`}
            />
        );
    }

    return (
        <div
            className={`rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0 ${sizeClasses[size]} ${className}`}
            style={{ backgroundColor: bgColor }}
            title={`${firstName || ''} ${lastName || ''}`.trim()}
        >
            {initials}
        </div>
    );
}
