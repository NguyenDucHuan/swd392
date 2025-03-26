import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiCloseLine } from 'react-icons/ri';
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
  const [isUpdateImagePackage, setIsUpdateImagePackage] = useState(false);
  const [isUpdateImageBlindBoxes, setIsUpdateImageBlindBoxes] = useState([false]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    description: '',
    type: ''
  });
  const [featureTypes, setFeatureTypes] = useState([]);
  const [addingFeature, setAddingFeature] = useState(false);
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

  useEffect(() => {
    if (formData.blindBoxes && formData.blindBoxes.length > 0) {
      setIsUpdateImageBlindBoxes(new Array(formData.blindBoxes.length).fill(false));
    }
  }, [formData.blindBoxes.length]);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/package?packageId=${packageId}&filter=all`);
        const packageData = response.data;
        
        const isKnown = packageData.blindBoxes && packageData.blindBoxes.length > 0 
          ? packageData.blindBoxes[0].isKnowned 
          : true;
        setIsKnownPackage(isKnown);
        if (packageData.images?.$values && packageData.images.$values.length > 0) {
          setCurrentImages(packageData.images.$values);
        }

        const processedBlindBoxes = packageData.blindBoxes?.$values?.map(box => ({
          blindBoxId: box.blindBoxId,
          color: box.color || '',
          status: box.status,
          size: box.size || 10,
          price: box.price,
          discount: box.discount,
          number: box.number,
          isKnowned: box.isKnowned,
          isSpecial: box.isSpecial,
          currentImages: box.imageUrls?.$values || [],
          imageFiles: [],
          featureIds: box.features?.$values?.map(f => f.featureId) || []
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
  useEffect(() => {
    if (features.length > 0) {
      const types = [...new Set(features.map(feature => feature.type))];
      setFeatureTypes(types);
      if (types.length > 0 && !newFeature.type) {
        setNewFeature(prev => ({ ...prev, type: types[0] }));
      }
    }
  }, [features]);
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

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'pakageImages' && files.length > 0) {
        setIsUpdateImagePackage(true);
      }
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
  const handleNewFeatureChange = (e) => {
    const { name, value } = e.target;
    setNewFeature(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddFeature = async (e) => {
    e.preventDefault();
    setAddingFeature(true);
    
    try {
      if (!newFeature.description || !newFeature.type) {
        toast.error('Vui lòng điền đầy đủ thông tin đặc tính');
        return;
      }
      
      const response = await axios.post(`${BASE_URL}/features`, newFeature);
      
      // Refresh features list
      const featuresResponse = await axios.get(`${BASE_URL}/features`);
      if (featuresResponse.data && Array.isArray(featuresResponse.data.$values)) {
        setFeatures(featuresResponse.data.$values);
      }
      
      toast.success('Thêm đặc tính mới thành công!');
      setNewFeature({
        description: '',
        type: featureTypes[0]
      });
      setShowAddFeatureModal(false);
    } catch (error) {
      console.error('Failed to add feature:', error);
      toast.error('Không thể thêm đặc tính mới');
    } finally {
      setAddingFeature(false);
    }
  };
  const handleBlindBoxFileChange = (index, files) => {
    if (files.length > 0) {
      const updatedFlags = [...isUpdateImageBlindBoxes];
      updatedFlags[index] = true;
      setIsUpdateImageBlindBoxes(updatedFlags);
    }
    
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

  const handleFeatureToggle = (boxIndex, featureId) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    const currentFeatures = updatedBlindBoxes[boxIndex].featureIds || [];
    
    // Find the feature and its type
    const feature = features.find(f => f.featureId === featureId);
    if (!feature) return;
    
    if (currentFeatures.includes(featureId)) {
      updatedBlindBoxes[boxIndex].featureIds = currentFeatures.filter(id => id !== featureId);
    } else {
      const featuresOfSameType = features
        .filter(f => f.type === feature.type)
        .map(f => f.featureId);
      
      const filteredFeatures = currentFeatures.filter(id => !featuresOfSameType.includes(id));
      updatedBlindBoxes[boxIndex].featureIds = [...filteredFeatures, featureId];
    }
    
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };
 
  const removeCurrentImage = (index) => {
    setCurrentImages(currentImages.filter((_, i) => i !== index));
  };

  const removeBlindBoxCurrentImage = (boxIndex, imageIndex) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    updatedBlindBoxes[boxIndex].currentImages = updatedBlindBoxes[boxIndex].currentImages.filter((_, i) => i !== imageIndex);
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };

  const handleSubmitClick = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    
    try {
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
      
      const packageFormData = new FormData();
      packageFormData.append('pakageCode', formData.pakageCode);
      packageFormData.append('name', formData.name);
      packageFormData.append('description', formData.description || '');
      packageFormData.append('manufacturer', formData.manufacturer || '');
      packageFormData.append('categoryId', formData.categoryId);
      packageFormData.append('IsUpdateImagePackage', isUpdateImagePackage);
      
      // Add retained current images
      if (currentImages && currentImages.length > 0) {
        currentImages.forEach((image, index) => {
          if (typeof image === 'object') {
            packageFormData.append(`currentImages[${index}].imageId`, image.imageId || '');
            packageFormData.append(`currentImages[${index}].url`, image.url || '');
          } else {
            packageFormData.append(`currentImages[${index}]`, image);
          }
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
        packageFormData.append(`blindBoxes[${index}].isUpdateImageBlindBox`, isUpdateImageBlindBoxes[index]);
        
        // Add retained current images
        if (box.currentImages && box.currentImages.length > 0) {
          box.currentImages.forEach((image, imageIndex) => {
            if (typeof image === 'object') {
              packageFormData.append(`blindBoxes[${index}].currentImages[${imageIndex}].imageId`, image.imageId || '');
              packageFormData.append(`blindBoxes[${index}].currentImages[${imageIndex}].url`, image.url || '');
            } else {
              packageFormData.append(`blindBoxes[${index}].currentImages[${imageIndex}]`, image);
            }
          });
        }
        
        // Add new images
        if (box.imageFiles && box.imageFiles.length > 0) {
          box.imageFiles.forEach(file => {
            packageFormData.append(`blindBoxes[${index}].ImageFiles`, file);
          });
        }
        if (box.featureIds && box.featureIds.length > 0) {
          box.featureIds.forEach(featureId => {
            packageFormData.append(`blindBoxes[${index}].featureIds`, featureId);
          });
        }
      });
      const token = localStorage.getItem('access_token');
      await axios.put(`${BASE_URL}/package/update-package?packageId=${packageId}`, packageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Package đã được cập nhật thành công!');
      navigate('/packages');
    } catch (err) {
      console.error('Failed to update package:', err);
      toast.error(err.response?.data?.detail || 'Không thể cập nhật package. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
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
            className="px-4 py-2 bg-pink-500 text-white rounded-lg"
          >
            Quay lại danh sách Package
          </button>
        </div>
      </div>
    );
  }
  const getFeaturesByType = () => {
    const groupedFeatures = {};
    
    features.forEach(feature => {
      if (!groupedFeatures[feature.type]) {
        groupedFeatures[feature.type] = [];
      }
      groupedFeatures[feature.type].push(feature);
    });
    
    return groupedFeatures;
  };

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
          <form onSubmit={handleSubmitClick}>
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
              {formData.blindBoxes.map((box, index) => (
                <div key={index} className="mb-8 p-4 border rounded-lg bg-gray-50 relative">
                  
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
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor={`special-${index}`} className="ml-2 text-sm text-gray-700">
                          SECRET
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
                              onError={(e) => {
                                console.log("Failed to load image:", image.url || image);
                                e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                              }}
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Đặc tính
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddFeatureModal(true)}
                      className="px-3 py-1 bg-pink-300 text-white text-sm rounded-md hover:bg-pink-700 flex items-center"
                    >
                      <span className="mr-1">+</span> Thêm đặc tính
                    </button>
                  </div>
                    
                    <div className="space-y-4">
                      {Object.entries(getFeaturesByType()).map(([type, typeFeatures]) => (
                        <div key={type} className="border rounded-lg p-3 bg-white">
                          <h3 className="font-medium text-gray-800 mb-2">{type}</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                            {typeFeatures.map(feature => (
                              <div key={feature.featureId} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`feature-${index}-${feature.featureId}`}
                                  checked={box.featureIds?.includes(feature.featureId) || false}
                                  onChange={() => handleFeatureToggle(index, feature.featureId)}
                                  className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                />
                                <label htmlFor={`feature-${index}-${feature.featureId}`} className="ml-2 text-sm text-gray-700">
                                  {feature.description || feature.name}
                                </label>
                              </div>
                            ))}
                          </div>
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
                className="w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật Package'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận cập nhật</h3>
            <p className="mb-6">Bạn có chắc muốn cập nhật thông tin package này?</p>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleConfirmSubmit}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddFeatureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Thêm đặc tính mới</h3>
            
            <form onSubmit={handleAddFeature}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={newFeature.description}
                  onChange={handleNewFeatureChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="type"
                    value={newFeature.type}
                    onChange={handleNewFeatureChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    required
                  >
                    {featureTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  
                  <input
                    type="text"
                    name="type"
                    value={newFeature.type}
                    onChange={handleNewFeatureChange}
                    className="flex-1 p-2 border border-gray-300 rounded-md"
                    placeholder="Hoặc nhập loại mới"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button 
                  type="button"
                  onClick={() => setShowAddFeatureModal(false)}
                  className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  disabled={addingFeature}
                  className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50"
                >
                  {addingFeature ? 'Đang thêm...' : 'Thêm đặc tính'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditPackage;