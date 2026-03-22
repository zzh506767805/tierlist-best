'use client';

import { useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

interface Props {
  onAddImages: (files: File[]) => void;
  onAddText: (name: string) => void;
}

export default function ImageUploader({ onAddImages, onAddText }: Props) {
  const t = useTranslations('tool');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [textValue, setTextValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (imageFiles.length > 0) onAddImages(imageFiles);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddText(textValue);
    setTextValue('');
  };

  return (
    <div className="space-y-3">
      {/* Image upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${
          isDragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-white/20 hover:border-white/30'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-3xl mb-2">+</div>
        <p className="text-gray-400">{t('uploadHint')}</p>
      </div>

      {/* Text item input */}
      <form onSubmit={handleTextSubmit} className="flex gap-2">
        <input
          type="text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder={t('itemName')}
          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium"
        >
          {t('addItem')}
        </button>
      </form>
    </div>
  );
}
