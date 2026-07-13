using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using MiniERP.API.Data;
using MiniERP.API.Hubs;
using MiniERP.API.Repositories;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;
var builder = WebApplication.CreateBuilder(args);

// 1. KHAI BÁO SỬ DỤNG CONTROLLER (ĐÂY LÀ DÒNG BẠN BỊ THIẾU)
builder.Services.AddControllers().AddJsonOptions(options =>
{
    // Bỏ qua lỗi vòng lặp object vô hạn
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

// Các cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    // Tạo form nhập Token trên Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Vui lòng nhập theo cú pháp: Bearer {chuỗi_token_của_bạn}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});
// Đăng ký Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Đăng ký Repository
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
// Đăng ký Repository
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IPayrollRepository, PayrollRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddSignalR();

// Mở khóa CORS để Frontend có thể gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.SetIsOriginAllowed(_ => true) // SignalR yêu cầu cấu hình này thay vì AllowAnyOrigin()
                  .AllowAnyHeader()    // Cho phép mọi loại Header
                  .AllowAnyMethod()    // Cho phép mọi phương thức (GET, POST, PUT, DELETE)
                  .AllowCredentials(); // SignalR yêu cầu AllowCredentials
        });
});
// Đọc chìa khóa từ appsettings.json
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

// Đăng ký dịch vụ Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(key),
        RoleClaimType = ClaimTypes.Role
    };
});
builder.Services.AddAuthorization();
var app = builder.Build();

// Cấu hình HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
 
    app.UseCors("AllowAll");
    app.UseAuthentication();
    app.UseAuthorization();
}

//app.UseHttpsRedirection();

// 2. KÍCH HOẠT BẢN ĐỒ ĐỊNH TUYẾN CHO CÁC CONTROLLER
app.MapControllers();
app.MapHub<AppHub>("/appHub");

app.Run();