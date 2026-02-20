import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
    menuItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
        required: true,
    },
    name: String,
    price: Number,
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
});

const OrderSchema = new mongoose.Schema(
    {
        items: [OrderItemSchema],
        totalAmount: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            enum: ['pending', 'cooking', 'ready', 'completed', 'cancelled'],
            default: 'pending',
        },
        customerPhone: {
            type: String,
            required: false,
        },
        customerName: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
