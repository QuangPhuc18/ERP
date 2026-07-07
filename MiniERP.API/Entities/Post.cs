using System.ComponentModel.DataAnnotations;

namespace MiniERP.API.Entities
{
    public class Post
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Slug { get; set; } = string.Empty;

        [Required]
        public string Content { get; set; } = string.Empty; // Nội dung bài viết (HTML)

        public string? ImageUrl { get; set; } // Ảnh bìa bài viết

        [MaxLength(100)]
        public string? Topic { get; set; } // Chủ đề (Recipes, Sustainability...)

        public DateTime PublishDate { get; set; } = DateTime.Now;

        [MaxLength(100)]
        public string? Author { get; set; }
    }
}
