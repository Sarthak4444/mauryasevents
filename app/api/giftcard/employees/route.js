import mongoose from "mongoose";
import Employee from "../../../../models/Employee";
import GiftCardTransaction from "../../../../models/GiftCardTransaction";
import { NextResponse } from "next/server";

// Get all employees (for super admin)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const includeArchived = searchParams.get("includeArchived") === "true";
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const query = includeArchived ? {} : { status: 'active' };
    const employees = await Employee.find(query).sort({ createdAt: -1 });
    
    // Get transaction counts for each employee
    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        const transactionCount = await GiftCardTransaction.countDocuments({ employeeId: emp._id });
        const totalDeducted = await GiftCardTransaction.aggregate([
          { $match: { employeeId: emp._id, type: 'deduction' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        
        return {
          _id: emp._id,
          name: emp.name,
          passcode: emp.passcode,
          status: emp.status,
          notes: emp.notes,
          createdAt: emp.createdAt,
          transactionCount,
          totalDeducted: totalDeducted[0]?.total || 0
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      employees: employeesWithStats
    }, { status: 200 });
    
  } catch (error) {
    console.error("Get employees error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create a new employee
export async function POST(req) {
  try {
    const { name, passcode, notes } = await req.json();
    
    // Validate required fields
    if (!name || !passcode) {
      return NextResponse.json(
        { error: "Name and passcode are required" },
        { status: 400 }
      );
    }
    
    // Validate passcode format (4 digits)
    if (!/^\d{4}$/.test(passcode)) {
      return NextResponse.json(
        { error: "Passcode must be exactly 4 digits" },
        { status: 400 }
      );
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if passcode already exists
    const existingEmployee = await Employee.findOne({ passcode });
    if (existingEmployee) {
      return NextResponse.json(
        { error: "This passcode is already assigned to another employee" },
        { status: 400 }
      );
    }
    
    // Create the employee
    const newEmployee = new Employee({
      name: name.trim(),
      passcode,
      notes: notes || '',
      status: 'active'
    });
    
    await newEmployee.save();
    
    return NextResponse.json({
      success: true,
      message: "Employee created successfully",
      employee: {
        _id: newEmployee._id,
        name: newEmployee.name,
        passcode: newEmployee.passcode,
        status: newEmployee.status,
        notes: newEmployee.notes
      }
    }, { status: 201 });
    
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update an employee
export async function PUT(req) {
  try {
    const { employeeId, name, passcode, notes, status } = await req.json();
    
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }
    
    // If passcode is being changed, check for duplicates
    if (passcode && passcode !== employee.passcode) {
      if (!/^\d{4}$/.test(passcode)) {
        return NextResponse.json(
          { error: "Passcode must be exactly 4 digits" },
          { status: 400 }
        );
      }
      
      const existingEmployee = await Employee.findOne({ passcode, _id: { $ne: employeeId } });
      if (existingEmployee) {
        return NextResponse.json(
          { error: "This passcode is already assigned to another employee" },
          { status: 400 }
        );
      }
      employee.passcode = passcode;
    }
    
    // Update fields
    if (name) employee.name = name.trim();
    if (notes !== undefined) employee.notes = notes;
    if (status && ['active', 'archived'].includes(status)) {
      employee.status = status;
    }
    
    await employee.save();
    
    return NextResponse.json({
      success: true,
      message: "Employee updated successfully",
      employee: {
        _id: employee._id,
        name: employee.name,
        passcode: employee.passcode,
        status: employee.status,
        notes: employee.notes
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error("Update employee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete an employee (only if no transactions)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get("employeeId");
    
    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if employee has any transactions
    const transactionCount = await GiftCardTransaction.countDocuments({ employeeId });
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete employee with transaction history. Archive instead." },
        { status: 400 }
      );
    }
    
    await Employee.findByIdAndDelete(employeeId);
    
    return NextResponse.json({
      success: true,
      message: "Employee deleted successfully"
    }, { status: 200 });
    
  } catch (error) {
    console.error("Delete employee error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
