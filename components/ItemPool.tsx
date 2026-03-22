'use client';

import { useState } from 'react';
import { TierItem } from '../lib/types';
import DraggableItem from './DraggableItem';
import { useTranslations } from 'next-intl';

interface Props {
  items: TierItem[];
  onDragStart: (item: TierItem, sourceId: string) => void;
  onDrop: (targetId: string) => void;
  onDragEnd: () => void;
  onTouchDragStart?: (item: TierItem, sourceId: string, e: React.TouchEvent) => void;
}

export default function ItemPool({
  items,
  onDragStart,
  onDrop,
  onDragEnd,
  onTouchDragStart,
}: Props) {
  const t = useTranslations('tool');
  const [isOver, setIsOver] = useState(false);

  return (
    <div
      data-droptarget="pool"
      className={`min-h-[6rem] rounded-xl border border-dashed p-3 transition-colors ${
        isOver ? 'border-blue-500 bg-blue-500/5' : 'border-white/20 bg-white/[0.02]'
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsOver(true);
      }}
      onDragLeave={() => setIsOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsOver(false);
        onDrop('pool');
      }}
    >
      <div className="text-sm text-gray-500 mb-2 font-medium">{t('pool')}</div>
      {items.length === 0 ? (
        <p className="text-gray-600 text-sm">{t('noItems')}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              sourceId="pool"
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              onTouchDragStart={onTouchDragStart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
