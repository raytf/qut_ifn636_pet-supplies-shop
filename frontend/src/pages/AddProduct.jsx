import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import ProductForm from '../components/ProductForm';

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      await axiosInstance.post('/api/products', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Product</h1>
      {error && (
        <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2">{error}</p>
      )}
      <ProductForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
};

export default AddProduct;
