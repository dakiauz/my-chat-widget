interface AvatarProps {
    initials: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const Avatar = ({ initials, size = 'md', className = '' }: AvatarProps) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
    };

    return (
        <div className={`bg-green-600 rounded-full flex items-center justify-center ${sizeClasses[size]} ${className}`}>
            <span className="font-medium text-white">{initials}</span>
        </div>
    );
};
