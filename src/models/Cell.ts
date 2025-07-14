import mongoose from 'mongoose';

const cellSchema = new mongoose.Schema({
  id: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text', 'code'], required: true },
  cellList: { type: mongoose.Schema.Types.ObjectId, ref: 'CellList', required: true },
});

export const CellModel = mongoose.model('Cell', cellSchema);

const cellListSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
});

export const CellListModel = mongoose.model('CellList', cellListSchema); 