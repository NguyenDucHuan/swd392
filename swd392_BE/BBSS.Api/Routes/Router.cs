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

            public const string CreateUser = $"{Users}/create-user"; // Tạo mới user
            public const string UpdateUser = $"{Users}/" + "{" + nameof(Id) + "}"; // Cập nhật user (Manager/Admin)
            public const string UpdateUserStatus = $"{Users}/status/" + "{" + nameof(Id) + "}"; // Cập nhật trạng thái user

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
            public const string Wheel = $"{prefix}wheel";
            public const string GetWheel = $"{Wheel}";
            public const string GetWheelDetail = $"{Wheel}-detail";
            public const string PlayWheel = $"{Wheel}/spin";
        }
        public static class PackageRoute
        {
            public const string Packages = $"{prefix}package";
            public const string GetPackage = $"{Packages}";
            public const string GetPackages = $"{Packages}s";
            public const string CreateUnknownPackage = $"{Packages}/create-unknown-package";
            public const string CreateKnownPackage = $"{Packages}/create-known-package";
            public const string UpdatePackage = $"{Packages}/update-package";
            public const string DeletePackage = $"{Packages}/delete-package";
            public const string GetPackagesByPackageCode = $"{Packages}/by-code";
            public const string GetPackageCodes = $"{Packages}/package-codes";
        }
        public static class CategoryRoute
        {
            public const string Categories = $"{prefix}category";
            public const string GetCategory = $"{Categories}";
            public const string GetCategories = $"{prefix}categories";
            public const string CreateCategory = $"{Categories}/create-category";
            public const string UpdateCategory = $"{Categories}/update-category";
            public const string DeleteCategory = $"{Categories}/delete-category";
        }

        public static class TransactionRoute
        {
            public const string Transactions = $"{prefix}transactions";
            public const string GetAllTransactions = $"{Transactions}";
            public const string GetUserTransactions = $"{Transactions}/me";
            public const string GetTransaction = $"{Transactions}/{Id}";
        }

        public static class InventoryRoute
        {
            public const string Inventories = $"{prefix}inventories";
            public const string GetOwnInventories = $"{Inventories}/me";
            public const string GetOtherInventories = $"{Inventories}/other";
            public const string GetInventory = $"{Inventories}/{Id}";
        }

        public static class BlindBoxRoute
        {
            public const string BlindBoxes = $"{prefix}blindBoxes";
            public const string GetBlindBox = $"{BlindBoxes}/{Id}";
        }

        public static class FeatureRoute
        {
            public const string Features = $"{prefix}features";
            public const string GetFeatures = $"{Features}";
            public const string GetFeature = $"{Features}/{Id}";
            public const string CreateFeature = $"{Features}";
            public const string UpdateFeature = $"{Features}/{Id}";
            public const string DeleteFeature = $"{Features}/{Id}";
        }

        public static class FeedbackRoute
        {
            public const string Feedbacks = $"{Router.prefix}feedbacks";
            public const string GetFeedbackByProduct = $"{Feedbacks}/product/{{productId}}"; // Lấy danh sách feedback theo sản phẩm
            public const string GetAllFeedbacks = $"{Feedbacks}/manager-feedbacks"; // Lấy toàn bộ feedback (Manager)
            public const string CreateFeedback = $"{Feedbacks}/create-feedback"; // Tạo mới feedback
            public const string UpdateFeedbackStatus = $"{Feedbacks}/update-feedback-status/{{feedbackId}}"; // Cập nhật trạng thái feedback
        }

        public static class VoucherRoute
        {
            private const string prefix = "api/voucher";
            public const string GetVoucherById = $"{prefix}/{{id}}"; // Lấy thông tin voucher theo ID
            public const string GetAllVouchers = $"{prefix}/all"; // Lấy toàn bộ voucher
            public const string CreateVoucher = $"{prefix}/create"; // Tạo mới voucher
            public const string UpdateVoucher = $"{prefix}/update/{{id}}"; // Cập nhật voucher
            public const string DeleteVoucher = $"{prefix}/delete/{{id}}"; // Xóa voucher
        }

        public static class UserVoucherRoute
        {
            private const string prefix = "api/user-voucher";
            public const string GetUserVoucherById = $"{prefix}/{{id}}"; // Lấy thông tin UserVoucher theo ID
            public const string GetUserVouchersByUserId = $"{prefix}/user/{{userId}}"; // Lấy danh sách voucher của khách hàng
            public const string AssignVoucher = $"{prefix}/assign"; // Assign voucher cho khách hàng
            public const string RedeemVoucher = $"{prefix}/redeem/{{id}}"; // Đổi voucher
        }

        public static class DashboardRoute
        {
            public const string Dashboard = $"{prefix}dashboard";
            public const string GetMonthlyRevenue = $"{Dashboard}/monthly-revenue";
            public const string GetQuarterlyRevenue = $"{Dashboard}/quarterly-revenue";
            public const string GetYearlyRevenue = $"{Dashboard}/yearly-revenue";
            public const string GetMonthlyTotalFeedbacks = $"{Dashboard}/monthly-total-feedbacks";
            public const string GetQuarterlyTotalFeedbacks = $"{Dashboard}/quarterly-total-feedbacks";
            public const string GetYearlyTotalFeedbacks = $"{Dashboard}/yearly-total-feedbacks";
        }
    }
}
