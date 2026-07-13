using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace MiniERP.API.Hubs
{
    public class AppHub : Hub
    {
        // Có thể bổ sung thêm các hàm khi cần client gửi trực tiếp lên Hub
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }
    }
}
