using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Pomelo.EntityFrameworkCore.MySql.Scaffolding.Internal;

namespace BBSS.Domain.Entities;

public partial class BlindboxDbContext : DbContext
{
    public BlindboxDbContext()
    {
    }

    public BlindboxDbContext(DbContextOptions<BlindboxDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<BlindBox> BlindBoxes { get; set; }

    public virtual DbSet<BlindBoxFeature> BlindBoxFeatures { get; set; }

    public virtual DbSet<BlindBoxImage> BlindBoxImages { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Feature> Features { get; set; }

    public virtual DbSet<Feedback> Feedbacks { get; set; }

    public virtual DbSet<FeedbackVote> FeedbackVotes { get; set; }

    public virtual DbSet<InventoryItem> InventoryItems { get; set; }

    public virtual DbSet<Order> Orders { get; set; }

    public virtual DbSet<OrderDetail> OrderDetails { get; set; }

    public virtual DbSet<OrderStatus> OrderStatuses { get; set; }

    public virtual DbSet<Package> Packages { get; set; }

    public virtual DbSet<PackageImage> PackageImages { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserVoucher> UserVouchers { get; set; }

    public virtual DbSet<Voucher> Vouchers { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
 => optionsBuilder.UseMySql(GetConnectionString(), Microsoft.EntityFrameworkCore.ServerVersion.Parse("8.0.39-mysql"));

    private string GetConnectionString()
    {
        IConfiguration config = new ConfigurationBuilder()
             .SetBasePath(Directory.GetCurrentDirectory())
                    .AddJsonFile("appsettings.json", true, true)
                    .Build();
        var strConn = config["ConnectionStrings:BlindBoxDbConnection"];

        return strConn;
    }


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .UseCollation("utf8mb4_0900_ai_ci")
            .HasCharSet("utf8mb4");

        modelBuilder.Entity<BlindBox>(entity =>
        {
            entity.HasKey(e => e.BlindBoxId).HasName("PRIMARY");

            entity.ToTable("blind_box");

            entity.HasIndex(e => e.PackageId, "package_id");

            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.Color)
                .HasMaxLength(255)
                .HasColumnName("color");
            entity.Property(e => e.Discount)
                .HasPrecision(4, 2)
                .HasColumnName("discount");
            entity.Property(e => e.IsKnowned).HasColumnName("is_knowned");
            entity.Property(e => e.IsSold).HasColumnName("is_sold");
            entity.Property(e => e.IsSpecial).HasColumnName("is_special");
            entity.Property(e => e.Number).HasColumnName("number");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.Price)
                .HasPrecision(10, 2)
                .HasColumnName("price");
            entity.Property(e => e.Size).HasColumnName("size");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("status");

            entity.HasOne(d => d.Package).WithMany(p => p.BlindBoxes)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("blind_box_ibfk_1");
        });

        modelBuilder.Entity<BlindBoxFeature>(entity =>
        {
            entity.HasKey(e => e.BlindBoxFeatureId).HasName("PRIMARY");

            entity.ToTable("blind_box_feature");

            entity.HasIndex(e => e.BlindBoxId, "blind_box_id");

            entity.HasIndex(e => e.FeatureId, "feature_id");

            entity.Property(e => e.BlindBoxFeatureId).HasColumnName("blind_box_feature_id");
            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.FeatureId).HasColumnName("feature_id");

            entity.HasOne(d => d.BlindBox).WithMany(p => p.BlindBoxFeatures)
                .HasForeignKey(d => d.BlindBoxId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("blind_box_feature_ibfk_1");

            entity.HasOne(d => d.Feature).WithMany(p => p.BlindBoxFeatures)
                .HasForeignKey(d => d.FeatureId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("blind_box_feature_ibfk_2");
        });

        modelBuilder.Entity<BlindBoxImage>(entity =>
        {
            entity.HasKey(e => e.BlindBoxImageId).HasName("PRIMARY");

            entity.ToTable("blind_box_image");

            entity.HasIndex(e => e.BlindBoxId, "blind_box_id");

            entity.Property(e => e.BlindBoxImageId).HasColumnName("blind_box_image_id");
            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.Url)
                .HasMaxLength(255)
                .HasColumnName("url");

            entity.HasOne(d => d.BlindBox).WithMany(p => p.BlindBoxImages)
                .HasForeignKey(d => d.BlindBoxId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("blind_box_image_ibfk_1");
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.CategoryId).HasName("PRIMARY");

            entity.ToTable("category");

            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Feature>(entity =>
        {
            entity.HasKey(e => e.FeatureId).HasName("PRIMARY");

            entity.ToTable("feature");

            entity.Property(e => e.FeatureId).HasColumnName("feature_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Type)
                .HasColumnType("enum('Eye','Skin')")
                .HasColumnName("type");
        });

        modelBuilder.Entity<Feedback>(entity =>
        {
            entity.HasKey(e => e.FeedbackId).HasName("PRIMARY");

            entity.ToTable("feedback");

            entity.HasIndex(e => e.BlindBoxId, "blind_box_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.Content)
                .HasColumnType("text")
                .HasColumnName("content");
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("create_date");
            entity.Property(e => e.Image)
                .HasMaxLength(255)
                .HasColumnName("image");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .HasColumnName("title");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.BlindBox).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.BlindBoxId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("feedback_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.Feedbacks)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("feedback_ibfk_1");
        });

        modelBuilder.Entity<FeedbackVote>(entity =>
        {
            entity.HasKey(e => e.VoteId).HasName("PRIMARY");

            entity.ToTable("feedback_vote");

            entity.HasIndex(e => e.FeedbackId, "feedback_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.VoteId).HasColumnName("vote_id");
            entity.Property(e => e.FeedbackId).HasColumnName("feedback_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VoteDate)
                .HasColumnType("datetime")
                .HasColumnName("vote_date");
            entity.Property(e => e.VoteType)
                .HasColumnType("enum('Upvote','Downvote')")
                .HasColumnName("vote_type");

            entity.HasOne(d => d.Feedback).WithMany(p => p.FeedbackVotes)
                .HasForeignKey(d => d.FeedbackId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("feedback_vote_ibfk_1");

            entity.HasOne(d => d.User).WithMany(p => p.FeedbackVotes)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("feedback_vote_ibfk_2");
        });

        modelBuilder.Entity<InventoryItem>(entity =>
        {
            entity.HasKey(e => e.InventoryItemId).HasName("PRIMARY");

            entity.ToTable("inventory_item");

            entity.HasIndex(e => e.BlindBoxId, "blind_box_id");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.InventoryItemId).HasColumnName("inventory_item_id");
            entity.Property(e => e.AddDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("add_date");
            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.Status)
                .HasColumnType("enum('Available','Used','etc')")
                .HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.BlindBox).WithMany(p => p.InventoryItems)
                .HasForeignKey(d => d.BlindBoxId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("inventory_item_ibfk_2");

            entity.HasOne(d => d.User).WithMany(p => p.InventoryItems)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("inventory_item_ibfk_1");
        });

        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.OrderId).HasName("PRIMARY");

            entity.ToTable("order");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.HasIndex(e => e.VoucherId, "voucher_id");

            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Address)
                .HasMaxLength(255)
                .HasColumnName("address");
            entity.Property(e => e.OrderDate)
                .HasColumnType("datetime")
                .HasColumnName("order_date");
            entity.Property(e => e.Phone)
                .HasMaxLength(10)
                .HasColumnName("phone");
            entity.Property(e => e.TotalAmount)
                .HasPrecision(10, 2)
                .HasColumnName("total_amount");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");

            entity.HasOne(d => d.User).WithMany(p => p.Orders)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("order_ibfk_1");

            entity.HasOne(d => d.Voucher).WithMany(p => p.Orders)
                .HasForeignKey(d => d.VoucherId)
                .HasConstraintName("order_ibfk_2");
        });

        modelBuilder.Entity<OrderDetail>(entity =>
        {
            entity.HasKey(e => e.OrderDetailId).HasName("PRIMARY");

            entity.ToTable("order_detail");

            entity.HasIndex(e => e.BlindBoxId, "blind_box_id");

            entity.HasIndex(e => e.OrderId, "order_id");

            entity.HasIndex(e => e.PackageId, "package_id");

            entity.Property(e => e.OrderDetailId).HasColumnName("order_detail_id");
            entity.Property(e => e.BlindBoxId).HasColumnName("blind_box_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.UnitPrice)
                .HasPrecision(10, 2)
                .HasColumnName("unit_price");

            entity.HasOne(d => d.BlindBox).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.BlindBoxId)
                .HasConstraintName("order_detail_ibfk_2");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("order_detail_ibfk_1");

            entity.HasOne(d => d.Package).WithMany(p => p.OrderDetails)
                .HasForeignKey(d => d.PackageId)
                .HasConstraintName("order_detail_ibfk_3");
        });

        modelBuilder.Entity<OrderStatus>(entity =>
        {
            entity.HasKey(e => e.OrderStatusId).HasName("PRIMARY");

            entity.ToTable("order_status");

            entity.HasIndex(e => e.OrderId, "order_id");

            entity.Property(e => e.OrderStatusId).HasColumnName("order_status_id");
            entity.Property(e => e.OrderId).HasColumnName("order_id");
            entity.Property(e => e.Status)
                .HasColumnType("enum('Pending','Paid','Shipping','Completed','Canceled')")
                .HasColumnName("status");
            entity.Property(e => e.UpdateTime)
                .HasColumnType("datetime")
                .HasColumnName("update_time");

            entity.HasOne(d => d.Order).WithMany(p => p.OrderStatuses)
                .HasForeignKey(d => d.OrderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("order_status_ibfk_1");
        });

        modelBuilder.Entity<Package>(entity =>
        {
            entity.HasKey(e => e.PackageId).HasName("PRIMARY");

            entity.ToTable("package");

            entity.HasIndex(e => e.CategoryId, "category_id");

            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.CategoryId).HasColumnName("category_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.Manufacturer)
                .HasMaxLength(255)
                .HasColumnName("manufacturer");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.PakageCode)
                .HasMaxLength(255)
                .HasColumnName("pakage_code");

            entity.HasOne(d => d.Category).WithMany(p => p.Packages)
                .HasForeignKey(d => d.CategoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("package_ibfk_1");
        });

        modelBuilder.Entity<PackageImage>(entity =>
        {
            entity.HasKey(e => e.PackageImageId).HasName("PRIMARY");

            entity.ToTable("package_image");

            entity.HasIndex(e => e.PackageId, "package_id");

            entity.Property(e => e.PackageImageId).HasColumnName("package_image_id");
            entity.Property(e => e.PackageId).HasColumnName("package_id");
            entity.Property(e => e.Url)
                .HasMaxLength(255)
                .HasColumnName("url");

            entity.HasOne(d => d.Package).WithMany(p => p.PackageImages)
                .HasForeignKey(d => d.PackageId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("package_image_ibfk_1");
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasKey(e => e.TransactionId).HasName("PRIMARY");

            entity.ToTable("transaction");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.Property(e => e.TransactionId).HasColumnName("transaction_id");
            entity.Property(e => e.Amount)
                .HasPrecision(10, 2)
                .HasColumnName("amount");
            entity.Property(e => e.CreateDate)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("datetime")
                .HasColumnName("create_date");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.RelatedId).HasColumnName("related_id");
            entity.Property(e => e.Type)
                .HasColumnType("enum('Deposit','Deduction','BlindBoxOpen', 'Refund')")
                .HasColumnName("type");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Transactions)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("transaction_ibfk_1");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PRIMARY");

            entity.ToTable("user");

            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.ConfirmedEmail).HasColumnName("confirmed_email");
            entity.Property(e => e.DateOfBirth).HasColumnName("date_of_birth");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Image)
                .HasMaxLength(255)
                .HasColumnName("image");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Password)
                .HasMaxLength(255)
                .HasColumnName("password");
            entity.Property(e => e.Phone)
                .HasMaxLength(10)
                .HasColumnName("phone");
            entity.Property(e => e.Role)
                .HasColumnType("enum('Admin','Staff','User')")
                .HasColumnName("role");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("status");
            entity.Property(e => e.WalletBalance)
                .HasPrecision(10, 2)
                .HasDefaultValueSql("'0.00'")
                .HasColumnName("wallet_balance");
        });

        modelBuilder.Entity<UserVoucher>(entity =>
        {
            entity.HasKey(e => e.UserVoucherId).HasName("PRIMARY");

            entity.ToTable("user_voucher");

            entity.HasIndex(e => e.UserId, "user_id");

            entity.HasIndex(e => e.VoucherId, "voucher_id");

            entity.Property(e => e.UserVoucherId).HasColumnName("user_voucher_id");
            entity.Property(e => e.RedeemedDate)
                .HasColumnType("datetime")
                .HasColumnName("redeemed_date");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");

            entity.HasOne(d => d.User).WithMany(p => p.UserVouchers)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_voucher_ibfk_1");

            entity.HasOne(d => d.Voucher).WithMany(p => p.UserVouchers)
                .HasForeignKey(d => d.VoucherId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("user_voucher_ibfk_2");
        });

        modelBuilder.Entity<Voucher>(entity =>
        {
            entity.HasKey(e => e.VoucherId).HasName("PRIMARY");

            entity.ToTable("voucher");

            entity.Property(e => e.VoucherId).HasColumnName("voucher_id");
            entity.Property(e => e.Description)
                .HasMaxLength(255)
                .HasColumnName("description");
            entity.Property(e => e.DiscountAmount)
                .HasPrecision(10, 2)
                .HasColumnName("discount_amount");
            entity.Property(e => e.EndDate)
                .HasColumnType("datetime")
                .HasColumnName("end_date");
            entity.Property(e => e.MinimumPurchase)
                .HasPrecision(10, 2)
                .HasColumnName("minimum_purchase");
            entity.Property(e => e.StartDate)
                .HasColumnType("datetime")
                .HasColumnName("start_date");
            entity.Property(e => e.Status)
                .IsRequired()
                .HasDefaultValueSql("'1'")
                .HasColumnName("status");
            entity.Property(e => e.UsageLimit).HasColumnName("usage_limit");
            entity.Property(e => e.VoucherCode)
                .HasMaxLength(255)
                .HasColumnName("voucher_code");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
