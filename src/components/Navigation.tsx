import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Calendar, Newspaper, User } from 'lucide-react';

const Navigation: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: '首页' },
    { path: '/debate', icon: Users, label: '辩论空间' },
    { path: '/daily', icon: Calendar, label: '点滴日常' },
    { path: '/news', icon: Newspaper, label: '热点资讯' },
    { path: '/profile', icon: User, label: '我的' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex-1 flex flex-col items-center py-3 px-2 transition-all duration-200 ${
                isActive 
                  ? 'bg-gray-100 text-black' 
                  : 'text-gray-500 hover:text-black hover:bg-gray-50'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;