using Microsoft.EntityFrameworkCore; // <-- Báº¯t buá»™c pháº£i cÃ³ dÃ²ng nÃ y Ä‘á»ƒ gá»i EF Core
using MiniERP.API.Entities;

namespace MiniERP.API.Data
{
    // <-- ChÃº Ã½ Ä‘oáº¡n ": DbContext" á»Ÿ Ä‘Ã¢y. NÃ³ giÃºp class nÃ y káº¿ thá»«a cÃ¡c tÃ­nh nÄƒng cá»§a EF Core
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<StoreSetting> StoreSettings { get; set; }
        public DbSet<Department> Departments { get; set; }
        public DbSet<Employee> Employees { get; set; }

        // THÃŠM 2 Báº¢NG Má»šI VÃ€O ÄÃ‚Y:
        public DbSet<Project> Projects { get; set; }
        public DbSet<EmployeeProject> EmployeeProjects { get; set; }
        public DbSet<Timesheet> Timesheets { get; set; }
        public DbSet<EmployeeSchedule> EmployeeSchedules { get; set; }
        public DbSet<SupplierPayment> SupplierPayments { get; set; }
        public DbSet<Salary> Salaries { get; set; }
        public DbSet<SalaryAdvance> SalaryAdvances { get; set; }
        // Cáº¤U HÃŒNH FLUENT API
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Khởi tạo dữ liệu cấu hình cửa hàng mặc định
            modelBuilder.Entity<StoreSetting>().HasData(
                new StoreSetting 
                { 
                    Id = 1, 
                    StoreName = "Tạp Hóa NexERP", 
                    Slogan = "Authentic, transparent, and sophisticated.", 
                    Address = "123 Đường Bán Lẻ, Quận Trung Tâm, TP.HCM", 
                    Phone = "0909 123 456", 
                    Email = "contact@nexerp.com", 
                    FacebookUrl = "https://facebook.com/nexerp", 
                    LogoUrl = "storefront" 
                }
            );

            // 1. Cáº¥u hÃ¬nh KhÃ³a chÃ­nh kÃ©p cho báº£ng trung gian
            modelBuilder.Entity<EmployeeProject>()
                .HasKey(ep => new { ep.EmployeeId, ep.ProjectId });

            // 2. Cáº¥u hÃ¬nh quan há»‡ N-N
            modelBuilder.Entity<EmployeeProject>()
                .HasOne(ep => ep.Employee)
                .WithMany(e => e.EmployeeProjects)
                .HasForeignKey(ep => ep.EmployeeId);

            modelBuilder.Entity<EmployeeProject>()
                .HasOne(ep => ep.Project)
                .WithMany(p => p.EmployeeProjects)
                .HasForeignKey(ep => ep.ProjectId);
            modelBuilder.Entity<Employee>()
                .HasOne(e => e.Account)
                .WithOne(a => a.Employee)
                .HasForeignKey<Account>(a => a.EmployeeId);

            // 3. Kháº¯c phá»¥c lá»—i Cascade delete cá»§a SupplierPayment
            modelBuilder.Entity<SupplierPayment>()
                .HasOne(sp => sp.Supplier)
                .WithMany()
                .HasForeignKey(sp => sp.SupplierId)
                .OnDelete(DeleteBehavior.Restrict);

            // 4. Seeding Data cho Units
            modelBuilder.Entity<Unit>().HasData(
                new Unit { Id = 1, Name = "Cái", Description = "Đơn vị đếm chung" },
                new Unit { Id = 2, Name = "Hộp", Description = "Hộp giấy/nhựa" },
                new Unit { Id = 3, Name = "Lon", Description = "Lon nhôm/sắt" },
                new Unit { Id = 4, Name = "Chai", Description = "Chai nhựa/thủy tinh" },
                new Unit { Id = 5, Name = "Ly", Description = "Ly/Cốc nhựa" },
                new Unit { Id = 6, Name = "Gói", Description = "Gói nilon/giấy" },
                new Unit { Id = 7, Name = "Bịch", Description = "Bịch lớn" },
                new Unit { Id = 8, Name = "Tuýp", Description = "Tuýp kem/sữa" },
                new Unit { Id = 9, Name = "Lốc", Description = "Lốc 4-6 hộp/chai" },
                new Unit { Id = 10, Name = "Vỉ", Description = "Vỉ trứng/thuốc" },
                new Unit { Id = 11, Name = "Thùng", Description = "Thùng carton" },
                new Unit { Id = 12, Name = "Két", Description = "Két nhựa đựng chai" },
                new Unit { Id = 13, Name = "Dây", Description = "Dây nhiều gói nhỏ" },
                new Unit { Id = 14, Name = "Kg", Description = "Kilogram" },
                new Unit { Id = 15, Name = "Gram", Description = "Gram" }
            );

            // Cáº¥u hÃ¬nh ProductUoM Ä‘á»ƒ xÃ³a Product thÃ¬ xÃ³a luÃ´n ProductUoM (Cascade) nhÆ°ng Unit thÃ¬ Restrict
            modelBuilder.Entity<ProductUoM>()
                .HasOne(p => p.Unit)
                .WithMany()
                .HasForeignKey(p => p.UnitId)
                .OnDelete(DeleteBehavior.Restrict);
        }
        public DbSet<Account> Accounts { get; set; }
        public DbSet<Customer> Customers { get; set; }
        public DbSet<Supplier> Suppliers { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderDetail> OrderDetails { get; set; }
        public DbSet<PurchaseOrder> PurchaseOrders { get; set; }
        public DbSet<PurchaseOrderDetail> PurchaseOrderDetails { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<WorkShift> WorkShifts { get; set; }
        public DbSet<InventoryTransaction> InventoryTransactions { get; set; }
        public DbSet<InventoryAdjustment> InventoryAdjustments { get; set; }
        public DbSet<StockTake> StockTakes { get; set; }
        public DbSet<StockTakeDetail> StockTakeDetails { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Banner> Banners { get; set; }
        public DbSet<Unit> Units { get; set; }
        public DbSet<ProductUoM> ProductUoMs { get; set; }
    }
}
