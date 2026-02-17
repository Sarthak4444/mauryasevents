import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema({
  // Employee name
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  // Unique 4-digit passcode
  passcode: {
    type: String,
    required: true,
    unique: true,
    length: 4
  },
  
  // Employee status
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  
  // Optional notes about the employee
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, { timestamps: true });

// Index for faster queries
EmployeeSchema.index({ passcode: 1 });
EmployeeSchema.index({ status: 1 });

const Employee = mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema);

export default Employee;
