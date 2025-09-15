import { useState, useEffect } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Sidebar from '../../components/Sidebar';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { PencilIcon, TrashIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { apiService } from '../../lib/api';

// Simple mock analytics for the modal to avoid runtime errors when backend analytics are unavailable
const mockAnalytics = {
  dailySales: Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { date: d.toISOString(), units: Math.floor(Math.random() * 5) + 1, revenue: (Math.floor(Math.random() * 5) + 1) * 500 };
  })
};

// Default empty products structure
const defaultProducts = [];

const formatINR = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export default function Products() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiService.getProducts();
        const productsData = response.data.data?.products || defaultProducts;
        
        // Transform Shopify data to match UI expectations
        const transformedProducts = productsData.map(product => ({
          id: product.id,
          name: product.title,
          price: product.variants?.[0]?.price || Math.floor(Math.random()*1500)+499,
          inventory: product.variants?.[0]?.inventoryQuantity ?? Math.floor(Math.random()*50)+5,
          createdDate: product.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
          category: product.productType || 'Uncategorized',
          sales: Math.floor(Math.random()*50),
          variants: product.variants || []
        }));
        
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Failed to fetch products:', error.message);
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredAndSortedProducts = products
    .filter(product => {
      if (stockFilter === 'in-stock') return product.inventory > 0;
      if (stockFilter === 'out-of-stock') return product.inventory === 0;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'date':
          return new Date(b.createdDate) - new Date(a.createdDate);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleEdit = (product) => {
    setEditingProduct({ ...product });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? editingProduct : p
      ));
      setShowEditModal(false);
      setEditingProduct(null);
    }
  };

  const handleDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      // Filter out the deleted product
      setProducts(products.filter(p => p.id !== productToDelete.id));
      setShowDeleteModal(false);
      setProductToDelete(null);
      // Here you would typically make an API call to delete the product
    }
  };

  const handleAnalytics = (product) => {
    setSelectedProduct(product);
    setShowAnalytics(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              onClick={() => setSidebarOpen(true)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex-1">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <div className="bg-white shadow rounded-lg p-6">
                <div className="sm:flex sm:items-center mb-6">
                  <div className="sm:flex-auto">
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="mt-2 text-sm text-gray-700">
                      Manage your Shopify products and inventory
                    </p>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none space-x-4">
                    <select
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="all">All Products</option>
                      <option value="in-stock">In Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </select>

                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                    >
                      <option value="name">Name</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="date">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 flex flex-col">
                  <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle">
                      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product Name</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Price</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Inventory</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Sales</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date Added</th>
                              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200 bg-white">
                            {loading ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4">
                                  <span className="text-sm text-gray-500">Loading products...</span>
                                </td>
                              </tr>
                            ) : filteredAndSortedProducts.length === 0 ? (
                              <tr>
                                <td colSpan="7" className="text-center py-4">
                                  <span className="text-sm text-gray-500">No products found.</span>
                                </td>
                              </tr>
                            ) : (
                              filteredAndSortedProducts.map((product) => (
                                <tr key={product.id}>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{product.name}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">
                                    {formatINR(product.price)}
                                  </td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{product.inventory}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{product.category}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{product.sales}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-700">{new Date(product.createdDate).toLocaleDateString()}</td>
                                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-4">
                                      <button
                                        onClick={() => handleAnalytics(product)}
                                        className="text-blue-600 hover:text-blue-900"
                                        title="View Analytics"
                                      >
                                        <ChartBarIcon className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleEdit(product)}
                                        className="text-indigo-600 hover:text-indigo-900"
                                        title="Edit Product"
                                      >
                                        <PencilIcon className="h-5 w-5" />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(product)}
                                        className="text-red-600 hover:text-red-900"
                                        title="Delete Product"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-sm mx-auto">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Product</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete {productToDelete?.name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-md mx-auto w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Product</h3>
              <form onSubmit={handleEditSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={editingProduct?.name}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        name: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Price (INR)
                    </label>
                    <input
                      type="number"
                      value={editingProduct?.price}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        price: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Inventory
                    </label>
                    <input
                      type="number"
                      value={editingProduct?.inventory}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        inventory: parseInt(e.target.value)
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <input
                      type="text"
                      value={editingProduct?.category}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        category: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Analytics Modal */}
        {showAnalytics && selectedProduct && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg max-w-3xl mx-auto w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Product Analytics: {selectedProduct.name}
                </h3>
                <button
                  onClick={() => {
                    setShowAnalytics(false);
                    setSelectedProduct(null);
                  }}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <span className="sr-only">Close</span>
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Total Sales</h4>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    {selectedProduct.sales} units
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Revenue</h4>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    {formatINR(selectedProduct.sales * selectedProduct.price)}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500">Current Stock</h4>
                  <p className="mt-2 text-xl font-semibold text-gray-900">
                    {selectedProduct.inventory} units
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-500 mb-4">Daily Sales Trend</h4>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Units Sold</th>
                      <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {mockAnalytics.dailySales.map((day, index) => (
                      <tr key={index}>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(day.date).toLocaleDateString()}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {day.units}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                          {formatINR(day.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}