import { v2 as cloudinary } from 'cloudinary'

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

export default cloudinary

// Helper function to upload image
export const uploadImage = async (
  file: string | Buffer, 
  options: {
    folder?: string
    public_id?: string
    transformation?: any
  } = {}
) => {
  try {
    const result = await cloudinary.uploader.upload(file as any, {
      folder: options.folder || 'citixo',
      public_id: options.public_id,
      transformation: options.transformation,
      resource_type: 'auto'
    })
    
    return {
      success: true,
      public_id: result.public_id,
      secure_url: result.secure_url,
      url: result.url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }
  } catch (error:any) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error.message || 'Upload failed'
    }
  }
}

// Helper function to delete image
export const deleteImage = async (publicId: string) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return {
      success: result.result === 'ok',
      result: result.result
    }
  } catch (error:any) {
    console.error('Cloudinary delete error:', error)
    return {
      success: false,
      error: error.message || 'Delete failed'
    }
  }
}

// Helper function to generate transformation URL
export const getTransformedUrl = (
  publicId: string, 
  transformations: {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
  } = {}
) => {
  return cloudinary.url(publicId, {
    ...transformations,
    secure: true
  })
}

// Predefined transformations
export const imageTransformations = {
  thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto' },
  medium: { width: 400, height: 300, crop: 'fill', quality: 'auto' },
  large: { width: 800, height: 600, crop: 'fill', quality: 'auto' },
  avatar: { width: 100, height: 100, crop: 'fill', gravity: 'face', quality: 'auto' }
}
