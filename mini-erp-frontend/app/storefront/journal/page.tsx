"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import httpAxios from "../../../app/services/httpAxios";
import { PostDTO } from "../../../app/services/PostService";

export default function JournalPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    httpAxios.get("/Storefront/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Lỗi lấy bài viết:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto px-5 md:px-16 py-12">
      {/* Header Section */}
      <header className="mb-12 flex flex-col items-center text-center">
        <h1 className="font-sf-display text-sf-display-lg-mobile md:text-sf-display-lg text-sf-primary mb-6">The Journal</h1>
        
        {/* Search & Filters */}
        <div className="w-full max-w-3xl flex flex-col items-center gap-6">
          <div className="relative w-full">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-sf-on-surface-variant">search</span>
            <input 
              className="w-full bg-sf-surface-container-lowest border-0 border-b-2 border-sf-surface-variant focus:border-sf-primary focus:ring-0 pl-12 pr-4 py-3 font-sf-body text-sf-body-md transition-colors placeholder:text-sf-on-surface-variant/60 outline-none" 
              placeholder="Search articles..." 
              type="text"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="px-4 py-2 bg-sf-primary text-sf-on-primary font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-primary/90 transition-colors">All</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Recipes</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Sustainability</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Growers</button>
            <button className="px-4 py-2 bg-sf-surface-container-low text-sf-on-surface-variant font-sf-body text-sf-label-caps uppercase tracking-wider rounded-full hover:bg-sf-surface-container-high transition-colors">Health</button>
          </div>
        </div>
      </header>

      {/* Article List */}
      <div className="flex flex-col gap-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-sf-secondary-fixed border-t-sf-primary"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post, index) => (
            <Link key={post.id} href={`/storefront/journal/${post.id}`} className="block">
              <article className="group flex flex-col md:flex-row gap-8 items-center bg-sf-surface-container-lowest border border-sf-surface-variant/50 hover:shadow-[0_10px_40px_-15px_rgba(21,66,18,0.1)] transition-all duration-300 rounded-xl overflow-hidden cursor-pointer">
                <div className={`w-full md:w-2/5 aspect-square md:aspect-[4/5] overflow-hidden bg-sf-surface-container-low ${index % 2 !== 0 ? 'md:order-last' : ''}`}>
                  {post.imageUrl ? (
                    <img 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                      alt={post.title}
                      src={post.imageUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="material-symbols-outlined text-4xl text-gray-300">article</span>
                    </div>
                  )}
                </div>
                <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider">{post.topic || "Blog"}</span>
                    <span className="w-1 h-1 bg-sf-surface-variant rounded-full"></span>
                    <time className="font-sf-body text-sf-label-caps text-sf-on-surface-variant">
                      {new Date(post.publishDate || "").toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}
                    </time>
                  </div>
                  <h2 className="font-sf-display text-sf-headline-md text-sf-on-background mb-4 group-hover:text-sf-primary transition-colors">
                    {post.title}
                  </h2>
                  {/* Trích xuất một đoạn nội dung ngắn từ thẻ HTML */}
                  <div 
                    className="font-sf-body text-sf-body-lg text-sf-on-surface-variant mb-8 line-clamp-3 prose-p:my-0 prose-headings:my-0"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <div className="inline-flex items-center gap-2 font-sf-body text-sf-label-caps uppercase text-sf-primary tracking-wider hover:gap-4 transition-all w-fit">
                    Read Story
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </div>
                </div>
              </article>
            </Link>
          ))
        ) : (
          <p className="text-center text-gray-500 py-10">Chưa có bài viết nào.</p>
        )}

        {/* Load More */}
        {posts.length > 0 && (
          <div className="flex justify-center mt-8">
            <button className="px-8 py-3 border border-sf-primary text-sf-primary font-sf-body text-sf-label-caps uppercase tracking-wider hover:bg-sf-primary hover:text-sf-on-primary transition-colors duration-300 rounded-full">
              Load More Articles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
