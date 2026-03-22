'use client';

import { useCallback } from 'react';
import { TierItem } from '../lib/types';

interface Props {
  item: TierItem;
  sourceId: string;
  onDragStart: (item: TierItem, sourceId: string) => void;
  onDragEnd: () => void;
  onTouchDragStart?: (item: TierItem, sourceId: string, e: React.TouchEvent) => void;
}

export default function DraggableItem({ item, sourceId, onDragStart, onDragEnd, onTouchDragStart }: Props) {
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (onTouchDragStart) {
        onTouchDragStart(item, sourceId, e);
      }
    },
    [item, sourceId, onTouchDragStart]
  );

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
        onDragStart(item, sourceId);
      }}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      className="w-16 h-16 rounded cursor-grab active:cursor-grabbing select-none shrink-0 relative group overflow-hidden bg-white/10 hover:bg-white/20 transition-colors"
      title={item.name}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-xs text-center px-1 leading-tight font-medium">
          {item.name}
        </div>
      )}
    </div>
  );
}
