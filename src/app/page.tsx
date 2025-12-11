"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);

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

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* 移动端顶部导航栏 */}
      <header className="lg:hidden w-full p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black tracking-tight">
            ALEN SMITH
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
              ALEN
            </h1>
            <h2 className="text-[34px] font-bold text-black leading-[0.95] tracking-tight mt-1">
              SMITH
            </h2>
          </div>
        </div>

        {/* 导航菜单 - 优化间距 */}
        <nav className="flex-1">
          <ul className="space-y-8">
            <li>
              <a
                href="#"
                className="text-black font-bold text-[13px] uppercase tracking-[0.15em] hover:opacity-60 transition-opacity"
              >
                HOME
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                PORTFOLIO
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                ABOUT
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                BOOKS
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors block"
              >
                EXHIBITIONS
              </a>
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
      <main className="flex-1 relative w-[70%] flex items-center justify-center p-8 lg:p-12">
        <div className="w-full h-[60vh] lg:h-[calc(100vh-6rem)] relative overflow-hidden">
          {/* 幻灯片图片 */}
          <div className="relative w-full h-full">
            {images.map((image, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  className="object-cover"
                  priority={index === currentImage}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
