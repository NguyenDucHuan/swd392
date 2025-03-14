import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { RiAddLine, RiEdit2Line, RiFilter3Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../configs/globalVariables';

function PackageManager() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPackages();
  }, [pagination.currentPage, pagination.pageSize]);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/packages`, {
        params: {
          pageNumber: pagination.currentPage,
          pageSize: pagination.pageSize,
          searchTerm: searchTerm || undefined
        }
      });
      
      setPackages(response.data.items.$values || []);
      setPagination({
        ...pagination,
        totalItems: response.data.total || 0,
        totalPages: response.data.totalPages || 1
      });
    } catch (err) {
      setError('Failed to fetch packages');
      toast.error('Failed to load packages');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPackage(null);
  };

  return (
    <div className="flex-1 bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Package Manager</h1>
        
        {/* Search and actions */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
         
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg">
              <RiFilter3Line />
              <span>Filter</span>
            </button>
            
            <Link 
              to="/package/create" 
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <RiAddLine />
              <span>Add Package</span>
            </Link>
          </div>
        </div>
        
        {/* Packages table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">Loading packages...</div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">{error}</div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="px-6 py-4">Package ID</th>
                    <th className="px-6 py-4">Code</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Manufacturer</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <tr key={pkg.packageId} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">{pkg.packageId}</td>
                        <td className="px-6 py-4">{pkg.pakageCode}</td>
                        <td className="px-6 py-4">{pkg.name}</td>
                        <td className="px-6 py-4">{pkg.manufacturer}</td>
                        <td className="px-6 py-4">{pkg.category?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            
                            
                            <Link 
                              to={`/package/edit/${pkg.packageId}`}
                              className="p-1 text-yellow-500 hover:text-yellow-700"
                              title="Edit"
                            >
                              <span className="sr-only">Edit</span>
                              <RiEdit2Line className="w-5 h-5" />
                            </Link>
                            
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                        No packages found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              <div className="px-6 py-4 border-t flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {packages.length} out of {pagination.totalItems} packages
                </div>
                <div className="flex space-x-1">
                  <button
                    disabled={pagination.currentPage === 1}
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage - 1})}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.totalPages).keys()].map(page => (
                    <button
                      key={page}
                      onClick={() => setPagination({...pagination, currentPage: page + 1})}
                      className={`px-3 py-1 rounded border ${
                        pagination.currentPage === page + 1 ? 'bg-blue-500 text-white' : ''
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                  
                  <button
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => setPagination({...pagination, currentPage: pagination.currentPage + 1})}
                    className="px-3 py-1 rounded border disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Package Detail Modal */}
      {isModalOpen && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Package Details</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Basic Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Package ID</p>
                    <p>{selectedPackage.packageId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Package Code</p>
                    <p>{selectedPackage.pakageCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p>{selectedPackage.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Manufacturer</p>
                    <p>{selectedPackage.manufacturer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Category</p>
                    <p>{selectedPackage.category?.name}</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-gray-700">{selectedPackage.description}</p>
              </div>
              
              {selectedPackage.packageImages && selectedPackage.packageImages.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold mb-2">Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedPackage.packageImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.url} 
                          alt={`Package image ${index + 1}`} 
                          className="w-full h-32 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedPackage.blindBoxes && selectedPackage.blindBoxes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Blind Boxes ({selectedPackage.blindBoxes.length})</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b">
                          <th className="px-3 py-2">ID</th>
                          <th className="px-3 py-2">Color</th>
                          <th className="px-3 py-2">Price</th>
                          <th className="px-3 py-2">Discount</th>
                          <th className="px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedPackage.blindBoxes.map(box => (
                          <tr key={box.blindBoxId} className="border-b">
                            <td className="px-3 py-2">{box.blindBoxId}</td>
                            <td className="px-3 py-2">{box.color}</td>
                            <td className="px-3 py-2">${box.price}</td>
                            <td className="px-3 py-2">{box.discount}%</td>
                            <td className="px-3 py-2">
                              {box.isSold ? (
                                <span className="text-red-500">Sold</span>
                              ) : (
                                <span className="text-green-500">Available</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t flex justify-end space-x-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              
              <Link
                to={`/package/edit/${selectedPackage.packageId}`}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Edit Package
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageManager;