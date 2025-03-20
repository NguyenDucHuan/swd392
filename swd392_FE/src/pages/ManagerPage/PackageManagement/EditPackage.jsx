import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiCloseLine } from 'react-icons/ri';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../../configs/globalVariables';

function EditPackage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [features, setFeatures] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [isKnownPackage, setIsKnownPackage] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState({
    pakageCode: '',
    name: '',
    description: '',
    manufacturer: '',
    categoryId: '',
    pakageImages: [],
    blindBoxes: []
  });

  function createEmptyBlindBox(number = 1) {
    return {
      blindBoxId: 0,
      color: '',
      status: true,
      size: 10,
      price: '',
      discount: 0,
      number: number,
      isKnowned: true,
      isSpecial: false,
      imageFiles: [],
      currentImages: [],
      featureIds: []
    };
  }
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/packages/${packageId}?filter=all`);
        const packageData = response.data;
        
        const isKnown = packageData.blindBoxes && packageData.blindBoxes.length > 0 
          ? packageData.blindBoxes[0].isKnowned 
          : true;
        setIsKnownPackage(isKnown);
        if (packageData.images && packageData.images.length > 0) {
          setCurrentImages(packageData.images);
        }
        
        const processedBlindBoxes = packageData.blindBoxes?.map(box => ({
          blindBoxId: box.blindBoxId,
          color: box.color || '',
          status: box.status,
          size: box.size || 10,
          price: box.price,
          discount: box.discount,
          number: box.number,
          isKnowned: box.isKnowned,
          isSpecial: box.isSpecial,
          currentImages: box.images || [],
          imageFiles: [],
          featureIds: box.features?.map(f => f.featureId) || []
        })) || [];
        
        if (!processedBlindBoxes.length) {
          processedBlindBoxes.push(createEmptyBlindBox());
        }
        
        setFormData({
          pakageCode: packageData.pakageCode || '',
          name: packageData.name || '',
          description: packageData.description || '',
          manufacturer: packageData.manufacturer || '',
          categoryId: packageData.categoryId?.toString() || '',
          pakageImages: [],
          blindBoxes: processedBlindBoxes
        });
        
        setError(null);
      } catch (err) {
        console.error("Failed to fetch package:", err);
        setError("Không thể tải thông tin package");
        toast.error("Không thể tải thông tin package");
      } finally {
        setLoading(false);
      }
    };
    
    fetchPackage();
  }, [packageId]);

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

  // Add a new blind box (for known packages only)
  const addBlindBox = () => {
    if (!isKnownPackage) return;
    
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

  // Remove a blind box (for known packages only)
  const removeBlindBox = (index) => {
    if (!isKnownPackage) return;
    
    if (formData.blindBoxes.length <= 1) {
      toast.warning("Phải có ít nhất một BlindBox");
      return;
    }
    
    // Only allow removing new blind boxes that don't have an ID yet
    if (formData.blindBoxes[index].blindBoxId) {
      toast.warning("Không thể xóa BlindBox đã có trong hệ thống");
      return;
    }
    
    const updatedBlindBoxes = formData.blindBoxes.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };

  // Remove current image
  const removeCurrentImage = (index) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  // Remove blind box current image
  const removeBlindBoxCurrentImage = (boxIndex, imageIndex) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    updatedBlindBoxes[boxIndex].currentImages = updatedBlindBoxes[boxIndex].currentImages.filter((_, i) => i !== imageIndex);
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
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
      
      // Add retained current images
      if (currentImages && currentImages.length > 0) {
        currentImages.forEach((image, index) => {
          packageFormData.append(`currentImages[${index}]`, image.url || image);
        });
      }
      
      // Add new package images
      if (formData.pakageImages && formData.pakageImages.length > 0) {
        formData.pakageImages.forEach(file => {
          packageFormData.append('ImageFiles', file);
        });
      }
      
      // Add BlindBoxes
      formData.blindBoxes.forEach((box, index) => {
        // Add existing blindBox ID if it exists
        if (box.blindBoxId) {
          packageFormData.append(`blindBoxes[${index}].blindBoxId`, box.blindBoxId);
        }
        
        // Add basic blind box properties
        packageFormData.append(`blindBoxes[${index}].color`, box.color || '');
        packageFormData.append(`blindBoxes[${index}].status`, box.status);
        packageFormData.append(`blindBoxes[${index}].size`, box.size || 10);
        packageFormData.append(`blindBoxes[${index}].price`, box.price);
        packageFormData.append(`blindBoxes[${index}].discount`, box.discount);
        packageFormData.append(`blindBoxes[${index}].number`, box.number);
        packageFormData.append(`blindBoxes[${index}].isKnowned`, isKnownPackage);
        packageFormData.append(`blindBoxes[${index}].isSpecial`, box.isSpecial);
        
        // Add retained current images
        if (box.currentImages && box.currentImages.length > 0) {
          box.currentImages.forEach((image, imageIndex) => {
            packageFormData.append(`blindBoxes[${index}].currentImages[${imageIndex}]`, image.url || image);
          });
        }
        
        // Add new images
        if (box.imageFiles && box.imageFiles.length > 0) {
          box.imageFiles.forEach(file => {
            packageFormData.append(`blindBoxes[${index}].imageFiles`, file);
          });
        }
        
        // Add features
        if (box.featureIds && box.featureIds.length > 0) {
          box.featureIds.forEach(featureId => {
            packageFormData.append(`blindBoxes[${index}].featureIds`, featureId);
          });
        }
      });
      
      // Send the request
      await axios.put(`${BASE_URL}/packages/update-package?packageId=${packageId}`, packageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Package đã được cập nhật thành công!');
      navigate('/packages');
    } catch (err) {
      console.error('Failed to update package:', err);
      toast.error(err.response?.data?.detail || 'Không thể cập nhật package. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate('/packages')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Quay lại danh sách Package
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa Package</h1>
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
                
                {/* Current Images */}
                {currentImages && currentImages.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh hiện tại
                    </label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {currentImages.map((image, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={image.url || image} 
                            alt={`Package ${index}`} 
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            type="button"
                            onClick={() => removeCurrentImage(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 hover:text-red-600"
                          >
                            <RiCloseLine size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New Images */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thêm hình ảnh mới
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
                {isKnownPackage && (
                  <button
                    type="button"
                    onClick={addBlindBox}
                    className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    <RiAddLine className="mr-1" />
                    Thêm BlindBox
                  </button>
                )}
              </div>
              
              {formData.blindBoxes.map((box, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50 relative">
                  {isKnownPackage && formData.blindBoxes.length > 1 && !box.blindBoxId && (
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
                  
                  {/* Current BlindBox Images */}
                  {box.currentImages && box.currentImages.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hình ảnh BlindBox hiện tại
                      </label>
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        {box.currentImages.map((image, imageIndex) => (
                          <div key={imageIndex} className="relative">
                            <img 
                              src={image.url || image} 
                              alt={`BlindBox ${box.number} - ${imageIndex}`} 
                              className="w-full h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeBlindBoxCurrentImage(index, imageIndex)}
                              className="absolute top-1 right-1 bg-white rounded-full p-1 text-red-500 hover:text-red-600"
                            >
                              <RiCloseLine size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* New BlindBox Images */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thêm hình ảnh BlindBox mới
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
                  
                  {/* Features */}
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
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Package'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );}
  export default EditPackage;