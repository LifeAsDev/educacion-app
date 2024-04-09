import User from '@/models/user';
import mongoose, { Schema, models } from 'mongoose';

const userSchema = new Schema<User>(
  {
    firstName: {
      type: String,
      default: '',
    },
    imageUrl: String,
    lastName: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    location: {
      country: String,
      state: String,
      city: String,
      coords: { lat: Number, long: Number },
    },
    eventIds: { type: [String], default: [] },

    admin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default models.User || mongoose.model('User', userSchema);
