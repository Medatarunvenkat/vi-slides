import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'ended'], default: 'active' }
});

const Session = mongoose.model('Session', sessionSchema);
export default Session;
