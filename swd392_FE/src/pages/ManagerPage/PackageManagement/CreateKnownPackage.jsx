import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../configs/globalVariables';

function CreateKnownPackage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]);
  
  // Form state
  const [formData, setFormData] = useState({
    pakageCode: '',
    name: '',
    description: '',
    manufacturer: '',
    categoryId: '',
    pakageImages: [],
    blindBoxes: [createEmptyBlindBox()]
  });

  // Helper function to create an empty blind box
  function createEmptyBlindBox() {
    return {
      color: '',
    status: true,
    size: 10,
    price: '',
    discount: 0,
    number: 1,
    isKnowned: true,
    isSpecial: false,
    imageFiles: [], 
    featureIds: []
    };
  }

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

  // Fetch features
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/features`);
        
        if (response.data && Array.isArray(response.data)) {
          setFeatures(response.data);
        } else if (response.data && Array.isArray(response.data.$values)) {
          setFeatures(response.data.$values);
        } else {
          console.error("Unexpected API response format:", response.data);
          setFeatures([]);
        }
      } catch (err) {
        console.error("Failed to fetch features:", err);
        toast.error("Không thể tải danh sách đặc điểm");
      }
    };
    
    fetchFeatures();
  }, []);

  // Handle form field changes for package details
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: Array.from(files)
      });
    } else if (type === 'number') {
      setFormData({
        ...formData,
        [name]: Math.max(0, parseFloat(value) || 0)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle changes for blind box fields
  const handleBlindBoxChange = (index, field, value) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    updatedBlindBoxes[index] = {
      ...updatedBlindBoxes[index],
      [field]: value
    };
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };

  // Handle file changes for blind box images
  const handleBlindBoxFileChange = (index, files) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    updatedBlindBoxes[index] = {
      ...updatedBlindBoxes[index],
      imageFiles: Array.from(files) 
    };
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };
  // Handle feature selection for blind box
  const handleFeatureToggle = (boxIndex, featureId) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    const currentFeatures = updatedBlindBoxes[boxIndex].featureIds || [];
    
    if (currentFeatures.includes(featureId)) {
      updatedBlindBoxes[boxIndex].featureIds = currentFeatures.filter(id => id !== featureId);
    } else {
      updatedBlindBoxes[boxIndex].featureIds = [...currentFeatures, featureId];
    }
    
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };

  // Add a new blind box
  const addBlindBox = () => {
    const lastBlindBox = formData.blindBoxes[formData.blindBoxes.length - 1];
    const newBlindBox = {
      ...createEmptyBlindBox(),
      number: (lastBlindBox.number || 0) + 1
    };
    
    setFormData({
      ...formData,
      blindBoxes: [...formData.blindBoxes, newBlindBox]
    });
  };

  // Remove a blind box
  const removeBlindBox = (index) => {
    if (formData.blindBoxes.length <= 1) {
      toast.warning("Phải có ít nhất một BlindBox");
      return;
    }
    
    const updatedBlindBoxes = formData.blindBoxes.filter((_, i) => i !== index);
    // Update numbers to maintain sequence
    const renumberedBlindBoxes = updatedBlindBoxes.map((box, idx) => ({
      ...box,
      number: idx + 1
    }));
    
    setFormData({
      ...formData,
      blindBoxes: renumberedBlindBoxes
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.pakageCode || !formData.name || !formData.categoryId) {
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
        setIsSubmitting(false);
        return;
      }

      // Validate BlindBoxes
      for (const box of formData.blindBoxes) {
        if (!box.price) {
          toast.error("Vui lòng nhập giá cho tất cả BlindBox");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Create form data object for file upload
      const packageFormData = new FormData();
      
      // Add basic fields
      packageFormData.append('pakageCode', formData.pakageCode);
      packageFormData.append('name', formData.name);
      packageFormData.append('description', formData.description || '');
      packageFormData.append('manufacturer', formData.manufacturer || '');
      packageFormData.append('categoryId', formData.categoryId);
      
      // Add package images
      if (formData.pakageImages && formData.pakageImages.length > 0) {
        formData.pakageImages.forEach(file => {
          packageFormData.append('pakageImages', file);
        });
      }
      
      // Add BlindBoxes
      formData.blindBoxes.forEach((box, index) => {
        Object.keys(box).forEach(key => {
          if (key === 'imageFiles') { 
            if (box.imageFiles && box.imageFiles.length > 0) {
              box.imageFiles.forEach(file => {
                packageFormData.append(`blindBoxes[${index}].imageFiles`, file);
              });
            }
          }else if (key === 'featureIds') {
            if (box.featureIds && box.featureIds.length > 0) {
              box.featureIds.forEach(featureId => {
                packageFormData.append(`blindBoxes[${index}].featureIds`, featureId);
              });
            }
          } else {
            packageFormData.append(`blindBoxes[${index}].${key}`, box[key]);
          }
        });
      });
      
      // Send the request
      await axios.post(`${BASE_URL}/package/create-known-package`, packageFormData, {
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
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tạo Known Package</h1>
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Quay lại
          </button>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-8">
              <h2 className="text-lg font-medium mb-4">Thông tin Package</h2>
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
              </div>
            </div>
            
            {/* BlindBoxes Section */}
            <div className="mt-8 border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">BlindBoxes</h2>
                <button
                  type="button"
                  onClick={addBlindBox}
                  className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  <RiAddLine className="mr-1" />
                  Thêm BlindBox
                </button>
              </div>
              
              {formData.blindBoxes.map((box, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50 relative">
                  {formData.blindBoxes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeBlindBox(index)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số thứ tự (BlindBox #{box.number})
                      </label>
                      <input
                        type="number"
                        value={box.number}
                        readOnly
                        className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Màu sắc
                      </label>
                      <input
                        type="text"
                        value={box.color}
                        onChange={(e) => handleBlindBoxChange(index, 'color', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kích thước (cm)
                      </label>
                      <input
                        type="number"
                        value={box.size}
                        onChange={(e) => handleBlindBoxChange(index, 'size', Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={box.price}
                        onChange={(e) => handleBlindBoxChange(index, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                        step="1000"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giảm giá (%)
                      </label>
                      <input
                        type="number"
                        value={box.discount}
                        onChange={(e) => handleBlindBoxChange(index, 'discount', Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                        min="0"
                        max="100"
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="flex space-x-4 items-center pt-6">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`special-${index}`}
                          checked={box.isSpecial}
                          onChange={(e) => handleBlindBoxChange(index, 'isSpecial', e.target.checked)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor={`special-${index}`} className="ml-2 text-sm text-gray-700">
                          Đặc biệt
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh BlindBox
                    </label>
                    <input
                      type="file"
                      onChange={(e) => handleBlindBoxFileChange(index, e.target.files)}
                      multiple
                      accept="image/*"
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Có thể chọn nhiều hình ảnh cho mỗi BlindBox.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tính năng đặc biệt
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {features.map(feature => (
                        <div key={feature.featureId} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`feature-${index}-${feature.featureId}`}
                            checked={box.featureIds?.includes(feature.featureId) || false}
                            onChange={() => handleFeatureToggle(index, feature.featureId)}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor={`feature-${index}-${feature.featureId}`} className="ml-2 text-sm text-gray-700">
                            {feature.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Submit */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang tạo...' : 'Tạo Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateKnownPackage;