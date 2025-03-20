import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../configs/globalVariables';

function CreateUnknownPackage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    pakageCode: '',
    name: '',
    description: '',
    manufacturer: '',
    categoryId: '',
    price: '',
    discount: '0',
    amountPackage: 1,
    amountBlindBox: 1,
    pakageImages: []
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/categories`);
        
        if (response.data && Array.isArray(response.data)) {
          setCategories(response.data);
        } else if (response.data && Array.isArray(response.data.$values)) {
          setCategories(response.data.$values);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCategories([]);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        toast.error("Không thể tải danh mục sản phẩm");
      }
    };
    
    fetchCategories();
  }, []);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: Array.from(e.target.files)
      });
    } else if (type === 'number') {
      // Ensure numeric values are positive
      setFormData({
        ...formData,
        [name]: Math.max(1, parseFloat(value) || 0)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create form data object for file upload
      const packageFormData = new FormData();
      
      // Add basic fields
      packageFormData.append('pakageCode', formData.pakageCode);
      packageFormData.append('name', formData.name);
      packageFormData.append('description', formData.description);
      packageFormData.append('manufacturer', formData.manufacturer);
      packageFormData.append('categoryId', formData.categoryId);
      packageFormData.append('price', formData.price);
      packageFormData.append('discount', formData.discount);
      packageFormData.append('amountPackage', formData.amountPackage);
      packageFormData.append('amountBlindBox', formData.amountBlindBox);
      
      // Add package images
      formData.pakageImages.forEach(file => {
        packageFormData.append('pakageImages', file);
      });
      
      // Send the request
      await axios.post(`${BASE_URL}/package/create-unknown-package`, packageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Package đã được tạo thành công!');
      navigate('/packages');
    } catch (err) {
      console.error('Failed to create package:', err);
      toast.error(err.response?.data?.detail || 'Không thể tạo package. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tạo Unknown Package</h1>
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Package Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã Package <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pakageCode"
                  value={formData.pakageCode}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên Package <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh mục <span className="text-red-500">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(category => (
                    <option key={category.categoryId} value={category.categoryId}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Manufacturer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nhà sản xuất
                </label>
                <input
                  type="text"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Discount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm giá (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              {/* Amount Package */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng Package <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amountPackage"
                  value={formData.amountPackage}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Amount BlindBox */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số lượng BlindBox mỗi Package <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amountBlindBox"
                  value={formData.amountBlindBox}
                  onChange={handleChange}
                  min="1"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              {/* Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh Package
                </label>
                <input
                  type="file"
                  name="pakageImages"
                  onChange={handleChange}
                  multiple
                  accept="image/*"
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Có thể chọn nhiều hình ảnh. Định dạng: JPG, PNG.
                </p>
              </div>
              
              {/* Submit */}
              <div className="md:col-span-2 mt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Package'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateUnknownPackage;