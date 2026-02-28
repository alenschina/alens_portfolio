"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { useNavigation, useImagesByCategory, useAbout, useContact, useSiteSettings } from "@/hooks/useApi";
import { getErrorMessage } from "@/lib/error-handler";

export default function Home() {
  const { settings: siteSettings } = useSiteSettings()
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("home");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    portfolio: false,
    works: false,
  });

  const thumbnailRef = useRef<HTMLDivElement>(null);

  // 滚动缩略图到选中项
  const scrollThumbnailToCenter = (index: number) => {
    const container = thumbnailRef.current;
    if (!container) return;

    const thumbnails = container.querySelectorAll('[data-thumbnail]');
    const target = thumbnails[index] as HTMLElement;
    if (!target) return;

    const containerWidth = container.clientWidth;
    const targetWidth = target.offsetWidth;
    const targetLeft = target.offsetLeft;

    const scrollPosition = targetLeft - (containerWidth - targetWidth) / 2;

    container.scrollTo({
      left: scrollPosition,
      behavior: 'smooth'
    });
  };

  // Use SWR hooks for data fetching with caching
  const { navigation, isLoading: navLoading, isError: navError } = useNavigation();
  const { images, isLoading: imagesLoading, isError: imagesError } = useImagesByCategory(
    selectedCategory === "about" || selectedCategory === "contact" ? null : selectedCategory
  );
  const { about, isLoading: aboutLoading } = useAbout();
  const { contact, isLoading: contactLoading } = useContact();

  const loading = navLoading || imagesLoading || aboutLoading || contactLoading;
  const error = navError || imagesError;

  // 自动轮播
  useEffect(() => {
    if (images.length === 0 || selectedCategory === "about" || selectedCategory === "contact") return;

    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length, selectedCategory]);

  // currentImage 变化时同步滚动缩略图
  useEffect(() => {
    if (selectedCategory !== "home" && images.length > 0) {
      scrollThumbnailToCenter(currentImage);
    }
  }, [currentImage, selectedCategory, images.length]);

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
    setCurrentImage(0);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // 加载中状态
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{getErrorMessage(error)}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const isAboutPage = selectedCategory === "about";
  const isContactPage = selectedCategory === "contact";

  return (
    <ErrorBoundary level="page">
      <div className="min-h-screen bg-white flex flex-col lg:flex-row overflow-hidden">
        {/* 移动端顶部导航栏 */}
        <header className="lg:hidden w-full p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-black tracking-tight">
              {siteSettings?.siteName || 'ALENS Photography'}
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

        {/* 桌面端左侧导航栏 */}
        <aside className="hidden lg:flex w-[30%] max-w-[380px] min-w-[300px] h-screen flex-col pl-[72px] pr-24 pt-20 pb-16">
          {/* 摄影师姓名 */}
          <div className="flex-shrink-0">
            <h1 className="text-[42px] font-bold text-black leading-[0.95] tracking-tight">
              {(siteSettings?.siteName || 'ALENS Photography').split(' ')[0]}
            </h1>
            <h2 className="text-[34px] font-bold text-black leading-[0.95] tracking-tight mt-1">
              {(siteSettings?.siteName || 'ALENS Photography').split(' ').slice(1).join(' ') || 'Photography'}
            </h2>
          </div>

          {/* 导航菜单 - 可滚动区域 */}
          <nav className="mt-24 flex-1 overflow-y-auto font-sans min-h-0 scrollbar-hide">
            <ul className="space-y-6">
              {navigation.map((item) => {
                if (item.type === "CATEGORY") {
                  const categorySlug = item.category?.slug || item.slug;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => handleCategorySelect(categorySlug)}
                        className={`whitespace-pre text-left transition-colors ${
                          selectedCategory === categorySlug
                            ? "text-black font-bold text-[13px] uppercase tracking-[0.15em]"
                            : "text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black"
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                } else if (
                  item.type === "PARENT" &&
                  item.children &&
                  item.children.length > 0
                ) {
                  const isExpanded = expandedCategories[item.slug] || false;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => toggleCategory(item.slug)}
                        className="w-full flex items-center justify-between text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black transition-colors group"
                      >
                        <span className="whitespace-pre">{item.title}</span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          className={`transition-transform duration-300 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
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
                          isExpanded
                            ? "max-h-48 opacity-100 translate-y-0"
                            : "max-h-0 opacity-0 -translate-y-2"
                        }`}
                      >
                        <ul className="ml-4 mt-3 space-y-2 pl-3 border-l border-gray-200">
                          {item.children.map((child) => {
                            const childCategorySlug =
                              child.category?.slug || child.slug;
                            return (
                              <li key={child.id}>
                                <button
                                  onClick={() =>
                                    handleCategorySelect(childCategorySlug)
                                  }
                                  className={`text-left transition-colors ${
                                    selectedCategory === childCategorySlug
                                      ? "text-black font-bold text-[10px] uppercase tracking-[0.12em]"
                                      : "text-gray-500 text-[10px] uppercase tracking-[0.1em] hover:text-black"
                                  } block py-1 w-full`}
                                >
                                  {child.title}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </li>
                  );
                } else {
                  const isAbout = item.type === "LINK" && item.slug === "about";
                  const isContact = item.type === "LINK" && item.slug === "contact";
                  const isActive = isAbout
                    ? selectedCategory === "about"
                    : isContact
                    ? selectedCategory === "contact"
                    : false;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() =>
                          handleCategorySelect(item.slug || "about")
                        }
                        className={`whitespace-pre w-full flex items-center justify-between text-left transition-colors ${
                          isActive
                            ? "text-black font-bold text-[11px] uppercase tracking-[0.15em]"
                            : "text-gray-600 text-[11px] uppercase tracking-[0.15em] hover:text-black"
                        }`}
                      >
                        {item.title}
                      </button>
                    </li>
                  );
                }
              })}
            </ul>
          </nav>

          {/* 社交媒体链接和备案信息 - 固定底部 */}
          <div className="mt-auto flex-shrink-0 pt-8">
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

            {/* 备案信息 */}
            {(siteSettings?.beianIcpNumber || siteSettings?.beianGongAnNumber) && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex flex-col gap-2">
                  {siteSettings?.beianGongAnNumber && (
                    <span className="text-[10px] text-gray-500">
                      {siteSettings.beianGongAnNumber}
                    </span>
                  )}
                  {siteSettings?.beianIcpNumber && (
                    <span className="text-[10px] text-gray-500">
                      {siteSettings.beianIcpNumber
                      }
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* 右侧内容区域 */}
        <main className="flex-1 relative flex flex-col p-12 lg:p-20 min-w-0">
          {/* About 页面内容 - 三栏布局 */}
          {isAboutPage ? (
            <div className="w-full h-full flex flex-row gap-8 lg:gap-12 items-start">
              {/* 头像区域 - 中间栏 */}
              <div className="w-[28%] flex-shrink-0">
                <div className="w-full aspect-[7/8] relative max-w-[260px]">
                  {about.avatar ? (
                    <Image
                      src={about.avatar}
                      alt={about.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No Photo
                    </div>
                  )}
                </div>
              </div>

              {/* 文字内容 - 右侧栏 */}
              <div className="flex-1 overflow-auto">
                {/* 摄影师姓名 */}
                {about.name && (
                  <div className="mb-8">
                    <h3 className="text-[18px] font-medium text-black">
                      {about.name}
                    </h3>
                  </div>
                )}

                {/* 简介 */}
                {about.intro && (
                  <div className="mb-10">
                    <p className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap font-serif">
                      {about.intro}
                    </p>
                  </div>
                )}

                {/* 详细描述 */}
                {about.description && (
                  <div className="mt-8">
                    <p className="text-[14px] text-gray-600 leading-[1.9] whitespace-pre-wrap font-serif">
                      {about.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : isContactPage ? (
            <div className="w-full h-full overflow-auto">
              {/* 标题 */}
              <div className="mb-12">
                <h2 className="text-[28px] font-light text-black tracking-tight">
                  {contact.title || 'Contact'}
                </h2>
              </div>

              {/* Representation */}
              {contact.representation && (
                <div className="mb-10">
                  <p className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap">
                    {contact.representation}
                  </p>
                </div>
              )}

              {/* Address */}
              <div className="mb-8">
                <p className="text-[15px] text-gray-800 leading-[1.8] whitespace-pre-wrap">
                  {contact.address}
                  {contact.city && (
                    <>
                      <br />
                      {contact.city}
                    </>
                  )}
                </p>
              </div>

              {/* Contact Info */}
              <div className="mt-10">
                {contact.phone && (
                  <p className="text-[15px] text-gray-800 leading-[1.8] mb-3">
                    T. {contact.phone}
                  </p>
                )}
                {contact.email && (
                  <p className="text-[15px] text-gray-800 leading-[1.8] mb-3">
                    E. {contact.email}
                  </p>
                )}
                {contact.website && (
                  <p className="text-[15px] text-gray-800 leading-[1.8]">
                    W. {contact.website}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 图片轮播区域 */}
              <div className="relative w-full h-[calc(100%-3.5rem)] flex items-center justify-center">
                <div className="relative w-full h-full relative overflow-hidden flex items-center justify-center">
                  {/* 幻灯片图片 */}
                  <div className="relative w-full h-full">
                    {images.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        No images found
                      </div>
                    ) : (
                      images.map((image, index) => (
                        <div
                          key={image.id}
                          className={`absolute inset-0 transition-opacity duration-1000 flex items-center justify-center ${
                            index === currentImage ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <Image
                            src={image.originalUrl}
                            alt={image.alt}
                            width={1200}
                            height={800}
                            className="max-w-full max-h-full object-contain"
                            priority={index === currentImage}
                          />
                        </div>
                      ))
                    )}
                  </div>

                  {/* 左侧切换按钮 - 仅非首页显示 */}
                  {selectedCategory !== "home" && images.length > 1 && (
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
                  )}

                  {/* 右侧切换按钮 - 仅非首页显示 */}
                  {selectedCategory !== "home" && images.length > 1 && (
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
                  )}
                </div>
              </div>

              {/* 缩略图列表 - 仅在非首页显示 */}
              {selectedCategory !== "home" && images.length > 0 && (
                <div className="h-16 mt-3 border-t border-gray-200 pt-3 w-full flex-shrink-0 max-w-[105%] mx-auto">
                  <div ref={thumbnailRef} className="flex gap-2 overflow-x-auto h-full w-full scrollbar-hide items-center">
                    {images.map((image, index) => (
                      <button
                        key={image.id}
                        data-thumbnail
                        onClick={() => goToSlide(index)}
                        className={`relative flex-shrink-0 w-14 h-14 rounded overflow-hidden transition-all ${
                          index === currentImage
                            ? "opacity-100"
                            : "opacity-60 hover:opacity-80"
                        }`}
                      >
                        <Image
                          src={image.thumbnailUrl || image.originalUrl}
                          alt={image.alt}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </ErrorBoundary>
  );
}
