import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ProductForm from '../components/ProductForm';

const EditProduct = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  const authHeader = { headers: { Authorization: `Bearer ${user.token}` } };

  // Fetch the existing product to pre-populate the form
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axiosInstance.get(`/api/products/${id}`, authHeader);
        setProduct(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product.');
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.put(`/api/products/${id}`, formData, authHeader);
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center mt-20 text-gray-500">Loading product…</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {error && (
        <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
      )}
      <ProductForm product={product} onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default EditProduct;
