"use client"

import React, { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react'
import { toast } from 'react-toastify'

interface UploadedImage {
  publicId: string
  url: string
  fileName: string
  width: number
  height: number
  size: number
}

interface ImageUploadProps {
  onImagesChange: (images: any) => void
  existingImages?: any
  maxImages?: number
  folder?: string
  accept?: string
  transformations?: any
  className?: string
}

export default function ImageUpload({
  onImagesChange,
  existingImages,
  maxImages = 5,
  folder = 'citixo',
  accept = 'image/*',
  transformations,
  className = ''
}: ImageUploadProps) {
  const [images, setImages] = useState<any>(existingImages)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const filesToUpload = Array.from(files)

    if (filesToUpload.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      filesToUpload.forEach(file => {
        formData.append('files', file)
      })
      formData.append('folder', folder)
      if (transformations) {
        formData.append('transformations', JSON.stringify(transformations))
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success && result.results.successful.length > 0) {
        const newImages = result.results.successful[0]
        setImages(newImages)
        onImagesChange(newImages)
        toast.success('Image uploaded successfully')
      } else {
        toast.error('Failed to upload image')
      }

      if (result.results.failed.length > 0) {
        console.error('Some uploads failed:', result.results.failed)
        toast.error(`${result.results.failed.length} file(s) failed to upload`)
      }

    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = async () => {
    const imageToRemove = images
    
    if (!imageToRemove) return
    
    try {
      // Delete from Cloudinary
      const response = await fetch(`/api/upload?publicId=${encodeURIComponent(imageToRemove.publicId)}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setImages(null)
        onImagesChange(null)
        toast.success('Image deleted successfully')
      } else {
        toast.error('Failed to delete image')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete image')
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  console.log("images", images);
  
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area - Show when no images or when maxImages > 1 */}
      {(!images || (maxImages > 1 && (!Array.isArray(images) || images.length < maxImages))) && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragOver
              ? 'border-blue-400 bg-blue-50 dark:bg-blue-950'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={maxImages > 1}
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          {uploading ? (
            <div className="flex flex-col items-center space-y-2">
              <Loader className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Click to upload
                </button>
                <span className="text-gray-500"> or drag and drop</span>
              </div>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to 10MB 
              </p>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Grid */}
      {images && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div key={images?.publicId} className="relative group">
            <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              <button
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 z-10 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={images?.url}
                alt={images?.fileName}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Image Info */}
            <div className="mt-2 text-xs text-gray-500">
              <p className="truncate">{images.fileName}</p>
              <p>{images?.width}×{images?.height} • {formatFileSize(images.size)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!images && (
        <div className="text-center py-4">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No images uploaded yet</p>
        </div>
      )}

     

    </div>
  )
}
