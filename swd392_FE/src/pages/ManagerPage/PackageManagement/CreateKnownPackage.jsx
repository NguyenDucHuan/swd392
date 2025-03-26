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
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newFeature, setNewFeature] = useState({
    description: '',
    type: ''
  });
  const [featureTypes, setFeatureTypes] = useState([]);
  const [addingFeature, setAddingFeature] = useState(false);
  const [showAddBlindBoxModal, setShowAddBlindBoxModal] = useState(false);
  const [blindBoxCount, setBlindBoxCount] = useState(1);

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

  // Extract feature types for the dropdown
  useEffect(() => {
    if (features.length > 0) {
      const types = [...new Set(features.map(feature => feature.type))];
      setFeatureTypes(types);
      if (types.length > 0 && !newFeature.type) {
        setNewFeature(prev => ({ ...prev, type: types[0] }));
      }
    }
  }, [features]);

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

  // Handle feature selection allowing only one per type
  const handleFeatureToggle = (boxIndex, featureId) => {
    const updatedBlindBoxes = [...formData.blindBoxes];
    const currentFeatures = updatedBlindBoxes[boxIndex].featureIds || [];
    
    // Find the feature and its type
    const feature = features.find(f => f.featureId === featureId);
    if (!feature) return;
    
    if (currentFeatures.includes(featureId)) {
      // If already selected, simply remove it
      updatedBlindBoxes[boxIndex].featureIds = currentFeatures.filter(id => id !== featureId);
    } else {
      // If selecting a new feature, first remove any other feature of the same type
      const featuresOfSameType = features
        .filter(f => f.type === feature.type)
        .map(f => f.featureId);
      
      const filteredFeatures = currentFeatures.filter(id => !featuresOfSameType.includes(id));
      
      // Then add the new feature
      updatedBlindBoxes[boxIndex].featureIds = [...filteredFeatures, featureId];
    }
    
    setFormData({
      ...formData,
      blindBoxes: updatedBlindBoxes
    });
  };

  // Handle adding a new feature
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

  // Add a new blind box
  const addBlindBox = (count = 1) => {
    const lastBlindBox = formData.blindBoxes[formData.blindBoxes.length - 1];
    const startNumber = (lastBlindBox.number || 0) + 1;
    
    const newBlindBoxes = [];
    for (let i = 0; i < count; i++) {
      newBlindBoxes.push({
        ...createEmptyBlindBox(),
        number: startNumber + i
      });
    }
    
    setFormData({
      ...formData,
      blindBoxes: [...formData.blindBoxes, ...newBlindBoxes]
    });
    
    setShowAddBlindBoxModal(false);
    setBlindBoxCount(1);
  };
  // Handle blind box count change
  const handleBlindBoxCountChange = (e) => {
    const value = parseInt(e.target.value);
    setBlindBoxCount(Math.max(1, isNaN(value) ? 1 : value));
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

  // Group features by type for display
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
                  onClick={() => setShowAddBlindBoxModal(true)} 
                  className="flex items-center px-3 py-1.5 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
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
                          className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                        />
                        <label htmlFor={`special-${index}`} className="ml-2 text-sm text-gray-700">
                          SECRET
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
                  
                  {/* Features - Updated with grouped features and add button */}
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
                {isSubmitting ? 'Đang tạo...' : 'Tạo Package'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Add Feature Modal */}
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
      {showAddBlindBoxModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Thêm BlindBox</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng BlindBox muốn thêm
              </label>
              <input
                type="number"
                min="1"
                value={blindBoxCount}
                onChange={handleBlindBoxCountChange}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setShowAddBlindBoxModal(false)}
                className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                type="button"
                onClick={() => addBlindBox(blindBoxCount)}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Thêm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateKnownPackage;