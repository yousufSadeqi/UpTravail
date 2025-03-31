export const getContrastColor = (bgColor: string) => {
  return bgColor.includes('white') || bgColor.includes('gray-50') || bgColor.includes('gray-100')
    ? 'text-gray-900'  // Dark text for light backgrounds
    : 'text-white';    // Light text for dark backgrounds
}; 