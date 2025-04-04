
import React from 'react';

interface ImagePlaceholderProps {
  width?: string;
  height?: string;
  text?: string;
  category?: string;
}

const getColorFromCategory = (category?: string): string => {
  switch (category) {
    case 'football':
      return 'bg-green-600';
    case 'cricket':
      return 'bg-blue-600';
    case 'basketball':
      return 'bg-orange-600';
    case 'tshirts':
      return 'bg-gray-600';
    case 'custom':
      return 'bg-purple-600';
    default:
      return 'bg-jersey-purple';
  }
};

const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  width = 'w-full',
  height = 'h-64',
  text,
  category
}) => {
  const colorClass = getColorFromCategory(category);
  
  return (
    <div className={`${width} ${height} ${colorClass} flex items-center justify-center rounded-md overflow-hidden`}>
      <div className="text-white text-center p-4">
        <span className="font-bold">{text || (category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Jersey` : 'Jersey Image')}</span>
      </div>
    </div>
  );
};

export default ImagePlaceholder;
