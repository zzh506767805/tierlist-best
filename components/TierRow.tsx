'use client';

import { useState } from 'react';
import { TierItem, TierRow } from '../lib/types';
import DraggableItem from './DraggableItem';
import { useTranslations } from 'next-intl';

interface Props {
  tier: TierRow;
  isDragging: boolean;
  onDragStart: (item: TierItem, sourceId: string) => void;
  onDrop: (targetId: string) => void;
  onDragEnd: () => void;
  onClear: (tierId: string) => void;
  onTouchDragStart?: (item: TierItem, sourceId: string, e: React.TouchEvent) => void;
}

export default function TierRowComponent({
  tier,
  isDragging,
  onDragStart,
  onDrop,
  onDragEnd,
  onClear,
  onTouchDragStart,
}: Props) {
  const t = useTranslations('tool');
  const [isOver, setIsOver] = useState(false);

  return (
    <div className="flex border-b border-white/5 last:border-b-0">
      {/* Tier label */}
      <div
        className="w-20 min-h-[4.5rem] flex items-center justify-center font-bold text-2xl shrink-0"
        style={{ backgroundColor: tier.color, color: '#000' }}
      >
        {tier.label}
      </div>

      {/* Drop zone */}
      <div
        data-droptarget={tier.id}
        className={`flex-1 min-h-[4.5rem] flex flex-wrap items-center gap-1 p-1.5 transition-colors ${
          isOver ? 'bg-white/10' : 'bg-white/[0.03]'
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
          onDrop(tier.id);
        }}
      >
        {tier.items.length === 0 && !isDragging && (
          <span className="text-gray-600 text-sm px-2">{t('emptyTier')}</span>
        )}
        {tier.items.map((item) => (
          <DraggableItem
            key={item.id}
            item={item}
            sourceId={tier.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onTouchDragStart={onTouchDragStart}
          />
        ))}
      </div>

      {/* Clear button */}
      {tier.items.length > 0 && (
        <button
          onClick={() => onClear(tier.id)}
          className="px-2 text-gray-600 hover:text-gray-400 transition-colors text-xs"
          title={t('clearTier')}
        >
          &times;
        </button>
      )}
    </div>
  );
}
