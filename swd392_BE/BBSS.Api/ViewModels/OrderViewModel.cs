﻿using BBSS.Api.Models.VoucherModel;
using BBSS.Domain.Entities;

namespace BBSS.Api.ViewModels
{
    public class OrderViewModel
    {
        public int OrderId { get; set; }

        public int UserId { get; set; }

        public string Name { get; set; } = null!;

        public string Email { get; set; } = null!;

        public string Address { get; set; } = null!;

        public string Phone { get; set; } = null!;

        public decimal TotalAmount { get; set; }

        public DateTime OrderDate { get; set; }

        public VoucherResponse Voucher { get; set; }

        public List<OrderDetailViewModel> Details { get; set; } = null!;

        public List<OrderStatusViewModel> Statuses { get; set; } = null!;

        public TransactionViewModel Transaction { get; set; }
    }

    public class OrderDetailViewModel
    {
        public int OrderDetailId { get; set; }

        public int? BlindBoxId { get; set; }

        public int? PackageId { get; set; }

        public decimal Price { get; set; }
    }

    public class OrderStatusViewModel
    {
        public string? Status { get; set; }

        public DateTime UpdateTime { get; set; }
    }
}
