'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn } from '@/lib/cn';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export function DropZone({ onFileSelect, selectedFile }: DropZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
        isDragActive
          ? 'border-blue-500 bg-blue-50'
          : selectedFile
          ? 'border-green-400 bg-green-50'
          : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
      )}
    >
      <input {...getInputProps()} />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-2">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-medium text-green-700">{selectedFile.name}</p>
          <p className="text-sm text-gray-500">
            {(selectedFile.size / 1024).toFixed(1)} KB · Click or drag to replace
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <svg
            className={cn('w-10 h-10', isDragActive ? 'text-blue-500' : 'text-gray-400')}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="font-medium text-gray-700">
            {isDragActive ? 'Drop the CSV file here' : 'Drag & drop a CSV file'}
          </p>
          <p className="text-sm text-gray-500">or click to browse · Max 50MB</p>
        </div>
      )}
    </div>
  );
}
