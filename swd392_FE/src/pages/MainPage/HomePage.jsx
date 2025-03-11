import logo2 from '../../assets/logo.jpg';
import logo1 from '../../assets/main1.jpg';
const HomePage = () => {
    return (
        <>
            <div className="min-h-screen bg-white text-center">
                {/* Header */}
                <header className="py-4 border-b">
                    <div className="container mx-auto flex justify-between items-center">
                        <img src={logo2} alt="BlindBox Logo" className="h-32" />
                        <nav className="space-x-6">
                            <a href="#" className="text-lg font-semibold">SALE UP TO 50%</a>
                            <a href="#" className="text-lg font-semibold">ALL PRODUCTS</a>
                            <a href="#" className="text-lg font-semibold">BLINDBOX SERIES</a>
                            <a href="#" className="text-lg font-semibold">GẤU BÔNG</a>
                        </nav>
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm"
                            className="border rounded px-3 py-1"
                        />
                    </div>
                </header>

                <div className="relative pb-3">
                    <div className="bg-dark mx- -m-3 border-0">
                        <img
                            className="w-full h-[500px] object-cover"
                            src={logo1}
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="container text-center text-white">
                                <h5 className="text-4xl font-light">New Season Arrivals</h5>
                                <p className="text-lg hidden sm:block">
                                    This is a wider card with supporting text below as a natural
                                    lead-in to additional content. This content is a little bit
                                    longer.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Banner */}
                <section className="relative w-full h-[400px] bg-cover bg-center flex items-center justify-center text-white" style={{ backgroundImage: "url('/banner.png')" }}>
                    <div className="bg-pink-500 bg-opacity-75 p-10 rounded-md">
                        <h2 className="text-5xl font-bold">HAPPY WOMEN'S DAY!</h2>
                        <p className="text-3xl mt-2">SALE UP TO 50%</p>
                        <p className="mt-2 text-lg">Giảm giá lên đến 50% áp dụng cho hơn 100 sản phẩm BlindBox siêu hot</p>
                    </div>
                </section>

                {/* Categories */}
                <section className="py-10">
                    <h2 className="text-3xl font-bold">DANH MỤC</h2>
                    {/* Add category items here */}
                </section>
            </div>
        </>
    );
};

export default HomePage;
