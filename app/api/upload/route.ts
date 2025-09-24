import { NextRequest, NextResponse } from 'next/server'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

// POST - Upload single or multiple images
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folder = formData.get('folder') as string || 'citixo'
    const transformations = formData.get('transformations') as string

    if (!files || files.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No files provided'
      }, { status: 400 })
    }

    const uploadPromises = files.map(async (file) => {
      // Convert file to buffer
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create data URL for upload
      const dataUrl = `data:${file.type};base64,${buffer.toString('base64')}`

      // Parse transformations if provided
      let transformationOptions = {}
      if (transformations) {
        try {
          transformationOptions = JSON.parse(transformations)
        } catch (e) {
          console.warn('Invalid transformation JSON:', e)
        }
      }

      // Upload to Cloudinary
      const result = await uploadImage(dataUrl, {
        folder,
        transformation: transformationOptions,
        public_id: `${folder}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })

      if (result.success) {
        return {
          success: true,
          fileName: file.name,
          publicId: result.public_id,
          url: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      } else {
        return {
          success: false,
          fileName: file.name,
          error: result.error
        }
      }
    })

    const results = await Promise.all(uploadPromises)
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return NextResponse.json({
      success: true,
      uploaded: successful.length,
      failed: failed.length,
      results: {
        successful,
        failed
      }
    })

  } catch (error:any) {
    console.error('Upload API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Upload failed',
      details: error.message
    }, { status: 500 })
  }
}

// DELETE - Delete image by public ID
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')

    if (!publicId) {
      return NextResponse.json({
        success: false,
        error: 'Public ID is required'
      }, { status: 400 })
    }

    const result = await deleteImage(publicId)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully',
        publicId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Delete failed'
      }, { status: 400 })
    }

  } catch (error:any) {
    console.error('Delete API error:', error)
    return NextResponse.json({
      success: false,
      error: 'Delete failed',
      details: error.message
    }, { status: 500 })
  }
}
