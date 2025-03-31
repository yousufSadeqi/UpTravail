import NotificationBar from './NotificationBar';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Other header content */}
          
          <div className="flex items-center space-x-4">
            <NotificationBar />
            {/* Other header items */}
          </div>
        </div>
      </div>
    </header>
  );
} 