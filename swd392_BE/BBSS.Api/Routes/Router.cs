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
            public const string Wheel = $"{prefix}wheel";
            public const string GetWheel = $"{Wheel}";
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
        }

        public static class InventoryRoute
        {
            public const string Inventories = $"{prefix}inventories";
            public const string GetInventories = $"{Inventories}";
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
    }
}
