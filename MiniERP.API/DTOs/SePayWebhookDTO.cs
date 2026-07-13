namespace MiniERP.API.DTOs
{
    public class SePayWebhookDTO
    {
        public int id { get; set; }
        public string gateway { get; set; }
        public string transactionDate { get; set; }
        public string accountNumber { get; set; }
        public string code { get; set; }
        public string content { get; set; }
        public string transferType { get; set; }
        public decimal transferAmount { get; set; }
    }
}
