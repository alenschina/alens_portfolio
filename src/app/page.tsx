"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    portfolio: true,
    books: false,
    exhibitions: false
  });

  // 摄影师作品集图片
  const images = [
    {
      src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2000&q=85",
      alt: "Urban Architecture Photography"
    },
    {
      src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85",
      alt: "Desert Landscape"
    },
    {
      src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85",
      alt: "Mountain Range at Sunset"
    },
    {
      src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85",
      alt: "Arctic Wilderness"
    },
    {
      src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85",
      alt: "Ocean Waves"
    }
  ];

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentImage(index);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* 移动端顶部导航栏 */}
      <header className="lg:hidden w-full p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black tracking-tight">
            ALENS FOTO
          </h1>
          <button
            className="p-2 text-gray-600 hover:text-black transition-colors"
            aria-label="Menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* 桌面端左侧导航栏 - 约占30-32%宽度 */}
      <aside className="hidden lg:flex w-[30%] max-w-[380px] min-w-[300px] h-screen flex-col pl-[72px] pr-24 pt-20 pb-16">
        {/* 摄影师姓名 - 调整字体层次 */}
        <div className="mb-24">
          <div>
            <h1 className="text-[42px] font-bold text-black leading-[0.95] tracking-tight">
              ALENS
            </h1>
            <h2 className="text-[34px] font-bold text-black leading-[0.95] tracking-tight mt-1">
              Photography
            </h2>
          </div>
        </div>

        {/* 导航菜单 - 多层级结构 */}
        <nav className="flex-1">
          <ul className="space-y-6">
            <li>
              <a
                href="#"
                className="text-black font-bold text-[13px] uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
              >
                HOME
              </a>
            </li>

            {/* PORTFOLIO - 可折叠 */}
            <li className="space-y-2">
              <button
                onClick={() => toggleCategory('portfolio')}
                className="w-full flex items-center justify-between text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors group"
              >
                <span>PORTFOLIO</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-300 ${expandedCategories.portfolio ? 'rotate-90' : ''}`}
                >
                  <path
                    d="M4 2L8 6L4 10"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategories.portfolio
                    ? 'max-h-48 opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                <ul className="ml-4 space-y-2 pl-3 border-l border-gray-200">
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Architecture
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Landscape
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Portrait
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Street Photography
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                ABOUT
              </a>
            </li>

            {/* BOOKS - 可折叠 */}
            <li className="space-y-2">
              <button
                onClick={() => toggleCategory('books')}
                className="w-full flex items-center justify-between text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors group"
              >
                <span>BOOKS</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-300 ${expandedCategories.books ? 'rotate-90' : ''}`}
                >
                  <path
                    d="M4 2L8 6L4 10"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategories.books
                    ? 'max-h-48 opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                <ul className="ml-4 space-y-2 pl-3 border-l border-gray-200">
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Urban Perspectives
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Nature's Light
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Human Stories
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            {/* EXHIBITIONS - 可折叠 */}
            <li className="space-y-2">
              <button
                onClick={() => toggleCategory('exhibitions')}
                className="w-full flex items-center justify-between text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors group"
              >
                <span>EXHIBITIONS</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-300 ${expandedCategories.exhibitions ? 'rotate-90' : ''}`}
                >
                  <path
                    d="M4 2L8 6L4 10"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedCategories.exhibitions
                    ? 'max-h-48 opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                <ul className="ml-4 space-y-2 pl-3 border-l border-gray-200">
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Solo Shows
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Group Exhibitions
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black transition-colors block py-1">
                      Upcoming Events
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                CONTACT
              </a>
            </li>
          </ul>
        </nav>

        {/* 社交媒体链接 - 调整位置 */}
        <div className="mt-20">
          <a
            href="#"
            className="inline-flex items-center text-gray-600 hover:text-black transition-colors"
            aria-label="Instagram"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
          </a>
        </div>
      </aside>

      {/* 右侧作品展示区域 - 幻灯片（占剩余70%宽度） */}
      <main className="flex-1 relative w-[70%] flex items-center justify-center p-12 lg:p-20">
        <div className="w-full h-[60vh] lg:h-[calc(100vh-6rem)] relative overflow-hidden flex items-center justify-center">
          {/* 幻灯片图片 */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={800}
                  unoptimized
                  className="max-w-full max-h-full object-contain"
                  priority={index === currentImage}
                />
              </div>
            ))}
          </div>

          {/* 左侧切换按钮 */}
          <button
            onClick={goToPrevious}
            className="absolute left-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors group"
            aria-label="Previous image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-gray-200"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* 右侧切换按钮 */}
          <button
            onClick={goToNext}
            className="absolute right-6 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors group"
            aria-label="Next image"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="group-hover:stroke-gray-200"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
