"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import PostService, { PostDTO } from "../../../../services/PostService";
import SettingsService from "../../../../services/SettingsService";
import dynamic from 'next/dynamic';

// Import react-quill dynamically to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
import 'react-quill-new/dist/quill.snow.css';

export default function EditPostPage() {
  const { id } = useParams();
  const router = useRouter();
  const isEdit = id !== "new";

  const [formData, setFormData] = useState<PostDTO>({
    title: "",
    slug: "",
    content: "",
    imageUrl: "",
    topic: "",
    author: ""
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (isEdit && id) {
      PostService.getById(Number(id))
        .then((res) => {
          setFormData(res);
          if (res.imageUrl) setImagePreview(res.imageUrl);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let finalImageUrl = formData.imageUrl;

      // Upload ảnh bìa nếu có
      if (imageFile) {
        finalImageUrl = await SettingsService.uploadLogo(imageFile);
      }

      const payload = { ...formData, imageUrl: finalImageUrl };

      if (isEdit) {
        await PostService.update(Number(id), payload);
      } else {
        await PostService.create(payload);
      }
      
      alert("Lưu thành công!");
      router.push("/dashboard/posts");
    } catch (err) {
      console.error(err);
      alert("Lỗi khi lưu bài viết.");
    } finally {
      setSaving(false);
    }
  };

  // Cấu hình thanh công cụ cho Quill Editor
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  }), []);

  if (loading) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEdit ? "Sửa Bài viết" : "Thêm Bài viết mới"}
          </h1>
        </div>
        <button 
          onClick={() => router.back()}
          className="text-gray-500 hover:text-gray-700 font-medium"
        >
          Quay lại
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  value={formData.title} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                  placeholder="Nhập tiêu đề bài viết..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Đường dẫn tĩnh)</label>
                <input 
                  type="text" 
                  name="slug" 
                  value={formData.slug} 
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50" 
                  placeholder="De-trong-de-tu-dong-tao"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chủ đề</label>
                  <input 
                    type="text" 
                    name="topic" 
                    value={formData.topic} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="VD: Recipes, Tips..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả</label>
                  <input 
                    type="text" 
                    name="author" 
                    value={formData.author} 
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded p-2 focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Tên tác giả"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh bìa bài viết</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img src={imagePreview} alt="Preview" className="max-h-48 rounded object-cover" />
                    <label className="absolute -bottom-3 -right-3 bg-white border border-gray-300 rounded-full p-2 cursor-pointer shadow hover:bg-gray-50 text-gray-600">
                      <span className="material-symbols-outlined text-sm block">edit</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">add_photo_alternate</span>
                    <p className="text-sm text-gray-500 font-medium">Click để chọn ảnh bìa</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung bài viết *</label>
            <div className="bg-white" style={{ minHeight: '300px' }}>
              <ReactQuill 
                theme="snow" 
                value={formData.content} 
                onChange={handleContentChange} 
                modules={modules}
                style={{ height: '300px', marginBottom: '50px' }}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded mr-4 hover:bg-gray-50 font-medium"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-medium flex items-center gap-2 disabled:bg-blue-400"
            >
              {saving ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang lưu...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">save</span>
                  Lưu Bài viết
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
