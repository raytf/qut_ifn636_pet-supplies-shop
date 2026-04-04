import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user.token}` } }),
    [user.token]
  );

  // Fetch categories once for the filter dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/api/categories', authHeader);
        setCategories(res.data);
      } catch {
        // Non-critical — filter dropdown just won't populate
      }
    };
    fetchCategories();
  }, [authHeader]);

  // Re-fetch products whenever search or category filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (search)         params.append('search', search);
        if (categoryFilter) params.append('category', categoryFilter);

        const res = await axiosInstance.get(`/api/products?${params.toString()}`, authHeader);
        setProducts(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, categoryFilter, authHeader]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/products/${id}`, authHeader);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center">
          + Add Product
        </Link>
      </div>

      {/* Search and filter controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-64 p-2 border rounded"
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="w-full sm:w-56 p-2 border rounded"
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading products…</p>}
      {error   && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      {!loading && !error && (
        products.length === 0 ? (
          <p className="text-gray-500">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-sm text-gray-700">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Category</th>
                  <th className="p-3 border-b">Price</th>
                  <th className="p-3 border-b">Stock</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50 text-sm">
                    <td className="p-3 border-b font-medium">{product.name}</td>
                    <td className="p-3 border-b text-gray-600">{product.category?.name || '—'}</td>
                    <td className="p-3 border-b">${product.price.toFixed(2)}</td>
                    <td className="p-3 border-b">{product.stock}</td>
                    <td className="p-3 border-b flex gap-2">
                      <Link
                        to={`/products/edit/${product._id}`}
                        className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-xs"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default ProductList;
