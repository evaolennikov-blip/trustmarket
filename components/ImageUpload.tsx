'use client'

import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadedFile {
  id: string
  url: string
  name: string
  progress: number
  error?: string
}

interface ImageUploadProps {
  onUpload: (urls: string[]) => void
  maxFiles?: number
}

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export default function ImageUpload({ onUpload, maxFiles = 5 }: ImageUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    const fileId = generateId()
    const ext = file.name.split('.').pop()
    const randomId = generateId()
    const path = `listings/${randomId}/${file.name}`

    const entry: UploadedFile = {
      id: fileId,
      url: '',
      name: file.name,
      progress: 0,
    }

    setFiles(prev => [...prev, entry])

    if (file.size > 10 * 1024 * 1024) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, error: 'Файл больше 10 МБ' } : f))
      return null
    }

    // Simulate progress start
    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 30 } : f))

    const { data, error } = await supabase.storage
      .from('listing-images')
      .upload(path, file, { upsert: false })

    if (error) {
      setFiles(prev => prev.map(f => f.id === fileId ? { ...f, error: error.message, progress: 0 } : f))
      return null
    }

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress: 80 } : f))

    const { data: publicData } = supabase.storage
      .from('listing-images')
      .getPublicUrl(data.path)

    const publicUrl = publicData.publicUrl

    setFiles(prev => prev.map(f => f.id === fileId ? { ...f, url: publicUrl, progress: 100 } : f))

    return publicUrl
  }, [])

  const handleFiles = useCallback(async (selected: FileList | null) => {
    if (!selected) return

    const available = maxFiles - files.filter(f => !f.error).length
    if (available <= 0) return

    const toUpload = Array.from(selected)
      .filter(f => f.type.startsWith('image/'))
      .slice(0, available)

    const results = await Promise.all(toUpload.map(uploadFile))
    const successUrls = results.filter(Boolean) as string[]

    setFiles(prev => {
      const allUrls = prev
        .filter(f => f.url && !f.error)
        .map(f => f.url)
      onUpload(allUrls)
      return prev
    })

    // Re-read current state after uploads complete
    setFiles(prev => {
      const allUrls = prev
        .filter(f => f.url && !f.error)
        .map(f => f.url)
      onUpload(allUrls)
      return prev
    })
  }, [files, maxFiles, uploadFile, onUpload])

  const removeFile = (id: string) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id)
      onUpload(updated.filter(f => f.url && !f.error).map(f => f.url))
      return updated
    })
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }
  const onDragLeave = () => setDragging(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const uploadedCount = files.filter(f => !f.error).length
  const canAdd = uploadedCount < maxFiles

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Фотографии <span className="text-gray-400 font-normal">({uploadedCount}/{maxFiles})</span>
      </label>

      {canAdd && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
            dragging
              ? 'border-trust-500 bg-trust-50'
              : 'border-gray-200 hover:border-trust-400 hover:bg-gray-50'
          }`}
        >
          <div className="text-3xl mb-2 text-gray-300">📷</div>
          <p className="text-sm font-medium text-gray-600">
            Перетащите фото или нажмите для выбора
          </p>
          <p className="text-xs text-gray-400 mt-1">
            До {maxFiles} фото, не более 10 МБ каждое
          </p>
          <button
            type="button"
            className="mt-3 px-4 py-2 bg-trust-700 hover:bg-trust-800 text-white text-sm font-medium rounded-lg transition"
            onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
          >
            Выбрать файлы
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {files.map(file => (
            <div key={file.id} className="relative group aspect-square">
              {file.url ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-full h-full rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center">
                  {file.error ? (
                    <span className="text-xs text-red-500 text-center px-1">{file.error}</span>
                  ) : (
                    <div className="w-full px-2">
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-trust-600 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 text-center mt-1">{file.progress}%</p>
                    </div>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-black/80 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                aria-label="Удалить"
              >
                ×
              </button>

              {file.url && file.progress === 100 && (
                <div className="absolute bottom-1 left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
