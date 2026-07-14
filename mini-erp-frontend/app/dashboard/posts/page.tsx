"use client";

import React, { useEffect, useState } from "react";
import PostService, { PostDTO } from "../../services/PostService";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PostsPage() {
  const [posts, setPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    setLoading(true);
    PostService.getAll()
      .then((res) => {
        setPosts(res);
      })
      .catch((err) => {
        console.error("Lỗi lấy bài viết:", err);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bài viết này không?")) {
      try {
        await PostService.delete(id);
        fetchPosts();
      } catch (err) {
        console.error("Lỗi xóa bài viết:", err);
        alert("Có lỗi xảy ra khi xóa bài viết.");
      }
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Bài viết</h1>
          <p className="text-gray-500 text-sm mt-1">Danh sách các bài viết trên trang Journal</p>
        </div>
        <button 
          onClick={() => router.push("/dashboard/posts/edit/new")}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Thêm Bài viết
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
              <th className="p-4 font-semibold w-16">ID</th>
              <th className="p-4 font-semibold">Ảnh bìa</th>
              <th className="p-4 font-semibold">Tiêu đề</th>
              <th className="p-4 font-semibold">Chủ đề</th>
              <th className="p-4 font-semibold">Ngày đăng</th>
              <th className="p-4 font-semibold text-center w-32">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {posts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">Chưa có bài viết nào</td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-gray-600">#{post.id}</td>
                  <td className="p-4">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} className="w-16 h-12 object-cover rounded shadow-sm" />
                    ) : (
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">image</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-gray-800">{post.title}</td>
                  <td className="p-4 text-gray-600">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{post.topic || "N/A"}</span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(post.publishDate || "").toLocaleDateString("vi-VN")}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => router.push(`/dashboard/posts/edit/${post.id}`)}
                        className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="Sửa bài viết"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(post.id!)}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                        title="Xóa bài viết"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
