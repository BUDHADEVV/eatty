import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a name for this item.'],
            maxlength: [60, 'Name cannot be more than 60 characters'],
        },
        description: {
            type: String,
            required: [true, 'Please provide a description'],
            maxlength: [200, 'Description cannot be more than 200 characters'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price.'],
        },
        category: {
            type: String,
            required: [true, 'Please provide a category.'],
        },
        image: {
            type: String,
            default: '/placeholder.svg',
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

export default mongoose.models.MenuItem || mongoose.model('MenuItem', MenuItemSchema);
