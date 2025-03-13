import { useEffect, useState } from "react";

function ShoppingPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const categories = ["LABUBU", "BaByThree", "Lucky BlindBox"];

  useEffect(() => {
    fetch("https://fakestoreapi.com/products") // API giả lập danh sách sản phẩm
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(error => console.error("Error fetching products:", error));
  }, []);

  const filterByCategory = (category) => {
    setSelectedCategory(category);
    if (category) {
      setFilteredProducts(products.filter(product => product.category === category));
    } else {
      setFilteredProducts(products);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Danh sách sản phẩm</h1>

      {/* Thanh danh mục */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded-lg transition ${selectedCategory === null ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          onClick={() => filterByCategory(null)}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button
            key={category}
            className={`px-4 py-2 rounded-lg transition ${selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
            onClick={() => filterByCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div key={product.id} className="border rounded-lg shadow-lg p-4 bg-white hover:shadow-xl transition">
            <img src={product.image} alt={product.title} className="w-full h-40 object-contain mb-4" />
            <h2 className="text-lg font-semibold truncate">{product.title}</h2>
            <p className="text-green-600 font-bold text-lg">${product.price}</p>
            <button className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">Mua ngay</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShoppingPage;