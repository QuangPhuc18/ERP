"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import httpAxios from "../../../services/httpAxios";
import Link from "next/link";
import { PostDTO } from "../../../services/PostService";

export default function JournalPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      httpAxios.get(`/Storefront/posts/${id}`)
        .then((res) => setPost(res.data))
        .catch((err) => console.error("Lỗi lấy bài viết:", err))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh] px-5 md:px-16 max-w-7xl mx-auto">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sf-secondary-fixed border-t-sf-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="px-5 md:px-16 py-20 text-center max-w-7xl mx-auto min-h-[50vh]">
        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">article</span>
        <h2 className="text-2xl font-bold mb-4 font-sf-display text-sf-on-surface">Không tìm thấy bài viết</h2>
        <button onClick={() => router.push("/storefront")} className="text-sf-primary hover:underline font-sf-body font-semibold">
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-5 md:px-16 py-12">
      {/* Header bài viết */}
      <header className="mb-10 text-center">
        <Link href="/storefront" className="inline-flex items-center gap-2 text-sm font-semibold text-sf-on-surface-variant hover:text-sf-primary transition-colors mb-6">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Quay lại
        </Link>
        <div className="mb-4">
          <span className="font-sf-body text-xs font-semibold text-sf-primary uppercase tracking-widest bg-sf-primary/10 px-3 py-1 rounded-full">
            {post.topic || "Blog"}
          </span>
        </div>
        <h1 className="font-sf-display text-4xl md:text-5xl font-bold text-sf-on-surface mb-6 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center justify-center gap-4 text-sm font-sf-body text-sf-on-surface-variant">
          <span>{new Date(post.publishDate || "").toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {post.author && (
            <>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span className="font-medium text-gray-700">bởi {post.author}</span>
            </>
          )}
        </div>
      </header>

      {/* Ảnh bìa */}
      {post.imageUrl && (
        <figure className="mb-12 w-full rounded-2xl overflow-hidden bg-sf-surface-container-low shadow-sm">
          <img 
            src={post.imageUrl} 
            alt={post.title} 
            className="w-full h-auto max-h-[60vh] object-cover"
          />
        </figure>
      )}

      {/* Nội dung bài viết (Render HTML từ ReactQuill) */}
      <div 
        className="prose prose-lg prose-blue max-w-none font-sf-body text-gray-800 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
