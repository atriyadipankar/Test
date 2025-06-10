"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UploadDataSheet from './UploadDataSheet';

// Icons can be replaced with your preferred icon library (React Icons, Heroicons, etc.)
// For this example, I'm using simple SVG components

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const pathname = usePathname();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const handleCreateClick = () => {
    setIsUploadOpen(true);
  };

  const menuItems = [
    { 
      name: 'Home', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      ), 
      href: '/' 
    },
    { 
      name: 'Competitions', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6v12"></path>
          <path d="M16 6v12"></path>
          <path d="M12 3c4.97 0 9 2.69 9 6v8c0 3.31-4.03 6-9 6s-9-2.69-9-6v-8c0-3.31 4.03-6 9-6z"></path>
        </svg>
      ), 
      href: '/competitions' 
    },
    { 
      name: 'Datasets', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="3" y1="15" x2="21" y2="15"></line>
        </svg>
      ), 
      href: '/datasets' 
    },
    { 
      name: 'Models', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      ), 
      href: '/models' 
    },
    { 
      name: 'Code', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ), 
      href: '/code' 
    },
    { 
      name: 'Discussions', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ), 
      href: '/discussions' 
    },
    { 
      name: 'Learn', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ), 
      href: '/learn' 
    },
    { 
      name: 'More', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      ), 
      href: '/more' 
    },
  ];

  return (
    <div className={`bg-white w-[240px] h-screen fixed left-0 top-0 border-r border-gray-200 flex flex-col transition-all duration-200 overflow-y-auto overflow-x-hidden z-10 ${isCollapsed ? 'w-[60px]' : ''}`}>
      <div className="flex items-center p-4 border-b border-gray-200">
        <button onClick={toggleSidebar} className="bg-transparent border-0 text-gray-500 cursor-pointer p-0 mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <div className="flex-1">
          <span className={`text-[#00b0ff] text-2xl font-bold whitespace-nowrap ${isCollapsed ? 'hidden' : ''}`}>TestDev</span>
        </div>
      </div>

      <div className="p-4 border-b border-gray-200">
        <button 
          onClick={handleCreateClick}
          className={`flex items-center bg-white text-gray-600 border border-gray-200 rounded-full text-base cursor-pointer w-full transition-all hover:bg-gray-50 ${isCollapsed ? 'justify-center p-2' : 'p-2 px-4'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-[#00b0ff] ${isCollapsed ? '' : 'mr-2'}`}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          {!isCollapsed && <span>Create</span>}
        </button>
        <UploadDataSheet open={isUploadOpen} onOpenChange={setIsUploadOpen} />
      </div>

      <nav className="flex-1 py-2">
        <ul className="list-none p-0 m-0">
          {menuItems.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>
                <div className={`flex items-center py-3 px-4 transition-colors hover:bg-gray-50 cursor-pointer whitespace-nowrap ${pathname === item.href ? 'text-[#00b0ff]' : 'text-gray-600'}`}>
                  <div className={`flex items-center justify-center mr-3 min-w-[24px] ${pathname === item.href ? 'text-[#00b0ff]' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  {!isCollapsed && <span>{item.name}</span>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="py-4 border-t border-gray-200">
        <Link href="/events">
          <div className="flex items-center py-3 px-4 text-gray-600 hover:bg-gray-50 cursor-pointer whitespace-nowrap">
            <div className="flex items-center justify-center mr-3 text-gray-500 min-w-[24px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            {!isCollapsed && <span>View Active Events</span>}
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
