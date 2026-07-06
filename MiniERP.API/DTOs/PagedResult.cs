namespace MiniERP.API.DTOs
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalItems { get; set; }
        public int TotalPages { get; set; }
        public int CurrentPage { get; set; }
        
        public PagedResult(List<T> items, int totalItems, int page, int pageSize)
        {
            Items = items;
            TotalItems = totalItems;
            CurrentPage = page;
            TotalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
        }
    }
}
