using BBSS.Domain.Entities;

namespace BBSS.Api.Routes
{
    public static class Router
    {
        public const string Id = "id";
        public const string prefix = "api/";

        public static class AtuthenticationRoute
        {
            public const string Authentication = $"{prefix}authen";
            public const string Register = $"{Authentication}/register";
            public const string Login = $"{Authentication}/login";
            public const string VerifyEmail = $"{Authentication}/verify-email";
        }

        public static class UserRoute
        {
            public const string Users = $"{prefix}users";
            public const string GetUpdateDelete = $"{Users}/" + "{" + Id + "}";
            public const string Profile = $"{Users}/profile";
            public const string UpdateProfile = $"{Users}/update-profile";
        }

        public static class OrderRoute
        {
            public const string Orders = $"{prefix}orders";
            public const string CreateOrder = $"{Orders}/order";
            public const string ConfirmOrder = $"{Orders}/confirm-order";
            public const string CompleteOrder = $"{Orders}/complete-order";
            public const string CancelOrder = $"{Orders}/cancel-order";
            public const string GetUserOrder = $"{Orders}/user-order/";
            public const string GetAllOrder = $"{Orders}/all-order/";
        }

        public static class PaymentRoute
        {
            public const string Payment = $"{prefix}payments";
            public const string MakePayment = $"{Payment}/payment";
            public const string AddToWallet = $"{Payment}/wallet-payment";
            public const string PaymentCallBack = $"{Payment}/payment-call-back";
        }

        public static class ExcelRoute
        {
            public const string Excel = $"{prefix}excels";
            public const string GetMonthlyRevenueExcel = $"{Excel}/monthly-revenue-excel";
            public const string GetQuarterlyRevenueExcel = $"{Excel}/quarterly-revenue-excel";
            public const string GetYearlyRevenueExcel = $"{Excel}/yearly-revenue-excel";
        }

        public static class WheelRoute
        {
            public const string Wheel = $"{prefix}wheels";
            public const string GetWheel = $"{Wheel}/wheel";
            public const string PlayWheel = $"{Wheel}/spinner";
        }
    }
}
