/**
 * Product model for the Petopia admin system.
 * Each product belongs to a Category and tracks inventory stock.
 * imageUrl is optional and can be a placeholder URL.
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
    },
    // Reference to the Category this product belongs to
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required'],
    },
    stock: {
        type: Number,
        required: [true, 'Stock is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
    },
    imageUrl: {
        type: String,
        trim: true,
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
