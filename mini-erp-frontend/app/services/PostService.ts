import httpAxios from "./httpAxios";

export interface PostDTO {
  id?: number;
  title: string;
  slug: string;
  content: string;
  imageUrl?: string;
  topic?: string;
  publishDate?: string;
  author?: string;
}

const PostService = {
  // Lấy toàn bộ bài viết (Dùng cho Admin)
  getAll: async (): Promise<PostDTO[]> => {
    const response = await httpAxios.get("/Posts");
    return response.data;
  },

  // Lấy chi tiết một bài viết
  getById: async (id: number): Promise<PostDTO> => {
    const response = await httpAxios.get(`/Posts/${id}`);
    return response.data;
  },

  // Thêm mới bài viết
  create: async (data: PostDTO): Promise<PostDTO> => {
    const response = await httpAxios.post("/Posts", data);
    return response.data;
  },

  // Cập nhật bài viết
  update: async (id: number, data: PostDTO): Promise<PostDTO> => {
    const response = await httpAxios.put(`/Posts/${id}`, data);
    return response.data;
  },

  // Xóa bài viết
  delete: async (id: number): Promise<void> => {
    await httpAxios.delete(`/Posts/${id}`);
  }
};

export default PostService;
