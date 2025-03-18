﻿namespace BBSS.Api.ViewModels
{
    public class TransactionViewModel
    {
        public int TransactionId { get; set; }

        public string? Type { get; set; }

        public int RelatedId { get; set; }

        public decimal Amount { get; set; }

        public DateTime CreateDate { get; set; }

        public string? Description { get; set; }

        public int UserId { get; set; }
    }
}
