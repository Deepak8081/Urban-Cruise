import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  // Common Fields
  name: { type: String, required: true },
  email: { type: String, lowercase: true },
  phone: { type: String },
  service: { type: String },
  source: {
    type: String,
    enum: ["Website", "Meta", "Google"],
    required: true
  },
  campaign: { type: String },
  adName: { type: String },
  formName: { type: String },
  platform: { type: String, enum: ["Facebook", "Instagram"] },
  keyword: { type: String },
  gclid: { type: String },
  campaignId: { type: String },

  message: { type: String },
  ipAddress: { type: String },
  userAgent: { type: String },

  status: {
    type: String,
    enum: ["New", "Contacted", "Qualified", "Converted", "Lost"],
    default: "New"
  },
  assignedTo: { type: String },
  notes: [{ text: String, date: { type: Date, default: Date.now } }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
leadSchema.index({ source: 1, createdAt: -1 });
leadSchema.index({ email: 1 });
leadSchema.index({ phone: 1 });

export default mongoose.model("Lead", leadSchema);