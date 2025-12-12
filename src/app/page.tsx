"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    portfolio: false,
    works: false
  });

  // 摄影师作品集图片 - 按分类组织
  const categoryImages = {
    home: [
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85",
        alt: "Featured Work 1"
      },
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85",
        alt: "Featured Work 2"
      },
      {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85",
        alt: "Featured Work 3"
      },
      {
        src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2000&q=85",
        alt: "Featured Work 4"
      },
      {
        src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85",
        alt: "Featured Work 5"
      }
    ],
    'portfolio-architecture': [
      {
        src: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=2000&q=85",
        alt: "Urban Architecture Photography"
      },
      {
        src: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=2000&q=85",
        alt: "Modern Building Architecture"
      },
      {
        src: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?w=2000&q=85",
        alt: "Architectural Detail"
      },
      {
        src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=2000&q=85",
        alt: "Contemporary Structure"
      }
    ],
    'portfolio-landscape': [
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85",
        alt: "Mountain Landscape"
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85",
        alt: "Valley View"
      },
      {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85",
        alt: "Coastal Scenery"
      }
    ],
    'portfolio-portrait': [
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=85",
        alt: "Portrait Series 1"
      },
      {
        src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=2000&q=85",
        alt: "Portrait Series 2"
      },
      {
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=2000&q=85",
        alt: "Portrait Series 3"
      }
    ],
    'portfolio-street': [
      {
        src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85",
        alt: "Street Photography 1"
      },
      {
        src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2000&q=85",
        alt: "Street Photography 2"
      },
      {
        src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85",
        alt: "Street Photography 3"
      }
    ],
    'works-urban': [
      {
        src: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=2000&q=85",
        alt: "Urban Perspectives 1"
      },
      {
        src: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=2000&q=85",
        alt: "Urban Perspectives 2"
      },
      {
        src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=2000&q=85",
        alt: "Urban Perspectives 3"
      }
    ],
    'works-nature': [
      {
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2000&q=85",
        alt: "Nature's Light 1"
      },
      {
        src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85",
        alt: "Nature's Light 2"
      },
      {
        src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2000&q=85",
        alt: "Nature's Light 3"
      }
    ],
    'works-human': [
      {
        src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=2000&q=85",
        alt: "Human Stories 1"
      },
      {
        src: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=2000&q=85",
        alt: "Human Stories 2"
      },
      {
        src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=2000&q=85",
        alt: "Human Stories 3"
      }
    ]
  };

  const images = categoryImages[selectedCategory as keyof typeof categoryImages] || categoryImages.home;

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

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setCurrentImage(0); // 重置到第一张图片
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
              <button
                onClick={() => handleCategorySelect('home')}
                className={`text-left transition-colors ${
                  selectedCategory === 'home'
                    ? 'text-black font-bold text-[13px] uppercase tracking-[0.15em]'
                    : 'text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black'
                }`}
              >
                HOME
              </button>
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
                    <button
                      onClick={() => handleCategorySelect('portfolio-architecture')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'portfolio-architecture'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Architecture
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('portfolio-landscape')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'portfolio-landscape'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Landscape
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('portfolio-portrait')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'portfolio-portrait'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Portrait
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('portfolio-street')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'portfolio-street'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Street Photography
                    </button>
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

            {/* WORKS - 可折叠 */}
            <li className="space-y-2">
              <button
                onClick={() => toggleCategory('works')}
                className="w-full flex items-center justify-between text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors group"
              >
                <span>WORKS</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  className={`transition-transform duration-300 ${expandedCategories.works ? 'rotate-90' : ''}`}
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
                  expandedCategories.works
                    ? 'max-h-48 opacity-100 translate-y-0'
                    : 'max-h-0 opacity-0 -translate-y-2'
                }`}
              >
                <ul className="ml-4 space-y-2 pl-3 border-l border-gray-200">
                  <li>
                    <button
                      onClick={() => handleCategorySelect('works-urban')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'works-urban'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Urban Perspectives
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('works-nature')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'works-nature'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Nature's Light
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleCategorySelect('works-human')}
                      className={`text-left transition-colors ${
                        selectedCategory === 'works-human'
                          ? 'text-black font-bold text-[10px] uppercase tracking-[0.12em]'
                          : 'text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black'
                      } block py-1 w-full`}
                    >
                      Human Stories
                    </button>
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
