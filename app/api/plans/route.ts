import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import { CitixoPlans } from "@/lib/models"

// GET - Fetch all plans
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'Active'
    const billingPeriod = searchParams.get('billingPeriod')

    // Build query
    let query: any = { status }
    if (billingPeriod) query.billingPeriod = billingPeriod

    // Get plans
    const plans = await CitixoPlans.find(query)
      .sort({ displayOrder: 1, price: 1 })

    // Transform data for backward compatibility
    const transformedPlans = plans.map(plan => ({
      id: plan.planId,
      name: plan.name,
      price: plan.price,
      period: plan.billingPeriod.toLowerCase().replace('ly', ''), // Monthly -> month
      description: plan.description,
      features: plan.features,
      status: plan.status,
      subscribers: plan.subscriberCount,
      popular: plan.isPopular,
      color: plan.colors.background,
      textColor: plan.colors.text,
      createdAt: plan.createdAt.toISOString().split('T')[0],
      // Additional new fields
      currency: plan.currency,
      benefits: plan.benefits,
      limits: plan.limits,
      colors: plan.colors
    }))

    return NextResponse.json({
      success: true,
      data: transformedPlans,
      count: transformedPlans.length
    })
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch plans" }, { status: 500 })
  }
}

// POST - Create new plan
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()

    // Validate required fields
    if (!body.name || !body.description || !body.price || !body.features) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields: name, description, price, features"
      }, { status: 400 })
    }

    // Generate unique plan ID
    const planId = `PLN${Date.now().toString().slice(-6)}`

    const newPlan = new CitixoPlans({
      planId,
      name: body.name,
      description: body.description,
      price: body.price,
      currency: body.currency || 'INR',
      billingPeriod: body.billingPeriod || 'Monthly',
      features: body.features,
      benefits: {
        serviceDiscount: body.benefits?.serviceDiscount || 0,
        prioritySupport: body.benefits?.prioritySupport || false,
        freeServices: body.benefits?.freeServices || 0,
        emergencySupport: body.benefits?.emergencySupport || false
      },
      limits: {
        maxBookingsPerMonth: body.limits?.maxBookingsPerMonth || null,
        maxServiceCategories: body.limits?.maxServiceCategories || []
      },
      status: body.status || 'Active',
      isPopular: body.isPopular || false,
      displayOrder: body.displayOrder || 0,
      colors: {
        background: body.colors?.background || '#f3f4f6',
        text: body.colors?.text || '#1f2937',
        accent: body.colors?.accent || '#0095FF'
      }
    })

    await newPlan.save()

    // Transform response to match old format
    const responseData = {
      id: newPlan.planId,
      name: newPlan.name,
      price: newPlan.price,
      period: newPlan.billingPeriod.toLowerCase().replace('ly', ''),
      description: newPlan.description,
      features: newPlan.features,
      status: newPlan.status,
      subscribers: newPlan.subscriberCount,
      popular: newPlan.isPopular,
      color: newPlan.colors.background,
      textColor: newPlan.colors.text,
      createdAt: newPlan.createdAt.toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Plan created successfully",
    })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json({ success: false, error: "Failed to create plan" }, { status: 500 })
  }
}

// PUT - Update plan
export async function PUT(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { planId, ...updateData } = body

    if (!planId) {
      return NextResponse.json({
        success: false,
        error: "Plan ID is required"
      }, { status: 400 })
    }

    const plan = await CitixoPlans.findOne({ planId })
    if (!plan) {
      return NextResponse.json({
        success: false,
        error: "Plan not found"
      }, { status: 404 })
    }

    // Update plan fields
    Object.assign(plan, updateData)
    await plan.save()

    return NextResponse.json({
      success: true,
      data: plan,
      message: "Plan updated successfully",
    })
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json({ success: false, error: "Failed to update plan" }, { status: 500 })
  }
}

// DELETE - Delete plan
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get("planId")

    if (!planId) {
      return NextResponse.json({
        success: false,
        error: "Plan ID is required"
      }, { status: 400 })
    }

    const result = await CitixoPlans.findOneAndUpdate(
      { planId },
      { status: 'Inactive' },
      { new: true }
    )

    if (!result) {
      return NextResponse.json({
        success: false,
        error: "Plan not found"
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Plan deactivated successfully",
    })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json({ success: false, error: "Failed to delete plan" }, { status: 500 })
  }
}