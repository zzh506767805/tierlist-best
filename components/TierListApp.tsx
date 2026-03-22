'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { TierItem, TierRow, DEFAULT_TIERS, TEMPLATES } from '../lib/types';
import TierRowComponent from './TierRow';
import ItemPool from './ItemPool';
import ImageUploader from './ImageUploader';

const STORAGE_KEY = 'tierlist-state';

let nextId = 1;
function genId() {
  return `item-${Date.now()}-${nextId++}`;
}

interface SavedState {
  tiers: { id: string; label: string; color: string; items: { id: string; name: string }[] }[];
  pool: { id: string; name: string }[];
}

function loadState(): { tiers: TierRow[]; pool: TierItem[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: SavedState = JSON.parse(raw);
    if (!saved.tiers || !saved.pool) return null;
    return {
      tiers: saved.tiers.map((t) => ({
        id: t.id,
        label: t.label,
        colorClass: `tier-${t.id}`,
        color: t.color,
        items: t.items,
      })),
      pool: saved.pool,
    };
  } catch {
    return null;
  }
}

function saveState(tiers: TierRow[], pool: TierItem[]) {
  try {
    const data: SavedState = {
      tiers: tiers.map((t) => ({
        id: t.id,
        label: t.label,
        color: t.color,
        items: t.items.filter((i) => !i.imageUrl).map(({ id, name }) => ({ id, name })),
      })),
      pool: pool.filter((i) => !i.imageUrl).map(({ id, name }) => ({ id, name })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function TierListApp() {
  const t = useTranslations('tool');

  const [tiers, setTiers] = useState<TierRow[]>(
    DEFAULT_TIERS.map((tier) => ({ ...tier, items: [] }))
  );
  const [pool, setPool] = useState<TierItem[]>([]);
  const [dragItem, setDragItem] = useState<{
    item: TierItem;
    sourceId: string;
  } | null>(null);

  const tierListRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchCloneRef = useRef<HTMLDivElement | null>(null);
  const touchDragRef = useRef<{ item: TierItem; sourceId: string } | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setTiers(saved.tiers);
      setPool(saved.pool);
    }
  }, []);

  // Save to localStorage on changes
  useEffect(() => {
    saveState(tiers, pool);
  }, [tiers, pool]);

  // Add items
  const addTextItem = useCallback((name: string) => {
    if (!name.trim()) return;
    setPool((prev) => [...prev, { id: genId(), name: name.trim() }]);
  }, []);

  const addImageItems = useCallback((files: File[]) => {
    const newItems: TierItem[] = [];
    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const name = file.name.replace(/\.[^.]+$/, '');
      newItems.push({ id: genId(), name, imageUrl: url });
    });
    setPool((prev) => [...prev, ...newItems]);
  }, []);

  // Drag handlers (desktop)
  const handleDragStart = useCallback(
    (item: TierItem, sourceId: string) => {
      setDragItem({ item, sourceId });
    },
    []
  );

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!dragItem) return;
      const { item, sourceId } = dragItem;
      if (sourceId === targetId) return;

      if (sourceId === 'pool') {
        setPool((prev) => prev.filter((i) => i.id !== item.id));
      } else {
        setTiers((prev) =>
          prev.map((tier) =>
            tier.id === sourceId
              ? { ...tier, items: tier.items.filter((i) => i.id !== item.id) }
              : tier
          )
        );
      }

      if (targetId === 'pool') {
        setPool((prev) => [...prev, item]);
      } else {
        setTiers((prev) =>
          prev.map((tier) =>
            tier.id === targetId
              ? { ...tier, items: [...tier.items, item] }
              : tier
          )
        );
      }

      setDragItem(null);
    },
    [dragItem]
  );

  const handleDragEnd = useCallback(() => {
    setDragItem(null);
  }, []);

  // Touch drag handlers (mobile)
  const handleTouchDragStart = useCallback(
    (item: TierItem, sourceId: string, e: React.TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      touchDragRef.current = { item, sourceId };
      setDragItem({ item, sourceId });

      // Create floating clone
      const el = e.currentTarget as HTMLElement;
      const clone = el.cloneNode(true) as HTMLDivElement;
      clone.style.position = 'fixed';
      clone.style.width = '64px';
      clone.style.height = '64px';
      clone.style.left = `${touch.clientX - 32}px`;
      clone.style.top = `${touch.clientY - 32}px`;
      clone.style.zIndex = '9999';
      clone.style.pointerEvents = 'none';
      clone.style.opacity = '0.85';
      clone.style.borderRadius = '8px';
      clone.style.boxShadow = '0 8px 32px rgba(0,0,0,0.5)';
      clone.style.transform = 'scale(1.1)';
      document.body.appendChild(clone);
      touchCloneRef.current = clone;
    },
    []
  );

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchDragRef.current || !touchCloneRef.current) return;
      e.preventDefault();
      const touch = e.touches[0];
      touchCloneRef.current.style.left = `${touch.clientX - 32}px`;
      touchCloneRef.current.style.top = `${touch.clientY - 32}px`;

      // Highlight drop target
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropTarget = el?.closest('[data-droptarget]') as HTMLElement | null;
      document.querySelectorAll('[data-droptarget]').forEach((dt) => {
        (dt as HTMLElement).style.outline = '';
        (dt as HTMLElement).style.outlineOffset = '';
      });
      if (dropTarget) {
        dropTarget.style.outline = '2px dashed #3b82f6';
        dropTarget.style.outlineOffset = '-2px';
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchDragRef.current) return;
      const { item, sourceId } = touchDragRef.current;

      // Clean up clone
      if (touchCloneRef.current) {
        touchCloneRef.current.remove();
        touchCloneRef.current = null;
      }

      // Clear highlights
      document.querySelectorAll('[data-droptarget]').forEach((dt) => {
        (dt as HTMLElement).style.outline = '';
        (dt as HTMLElement).style.outlineOffset = '';
      });

      // Find drop target
      const touch = e.changedTouches[0];
      const el = document.elementFromPoint(touch.clientX, touch.clientY);
      const dropTarget = el?.closest('[data-droptarget]') as HTMLElement | null;
      const targetId = dropTarget?.dataset.droptarget;

      if (targetId && targetId !== sourceId) {
        // Remove from source
        if (sourceId === 'pool') {
          setPool((prev) => prev.filter((i) => i.id !== item.id));
        } else {
          setTiers((prev) =>
            prev.map((tier) =>
              tier.id === sourceId
                ? { ...tier, items: tier.items.filter((i) => i.id !== item.id) }
                : tier
            )
          );
        }

        // Add to target
        if (targetId === 'pool') {
          setPool((prev) => [...prev, item]);
        } else {
          setTiers((prev) =>
            prev.map((tier) =>
              tier.id === targetId
                ? { ...tier, items: [...tier.items, item] }
                : tier
            )
          );
        }
      }

      touchDragRef.current = null;
      setDragItem(null);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Export as image
  const handleExport = useCallback(async () => {
    if (!tierListRef.current) return;
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(tierListRef.current, {
      backgroundColor: '#0f1117',
      scale: 2,
    });
    const link = document.createElement('a');
    link.download = 'tier-list.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    const allItems = tiers.flatMap((tier) => tier.items);
    setPool((prev) => [...prev, ...allItems]);
    setTiers((prev) => prev.map((tier) => ({ ...tier, items: [] })));
  }, [tiers]);

  // Load template
  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    const newItems: TierItem[] = template.items.map((name) => ({
      id: genId(),
      name,
    }));
    // Reset tiers and set pool
    setTiers(DEFAULT_TIERS.map((tier) => ({ ...tier, items: [] })));
    setPool(newItems);
  }, []);

  // Clear tier
  const handleClearTier = useCallback((tierId: string) => {
    setTiers((prev) => {
      const tier = prev.find((t) => t.id === tierId);
      if (!tier) return prev;
      setPool((p) => [...p, ...tier.items]);
      return prev.map((t) => (t.id === tierId ? { ...t, items: [] } : t));
    });
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
          >
            {t('reset')}
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors font-medium"
          >
            {t('export')}
          </button>
        </div>
      </div>

      {/* Templates */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-400 font-medium">{t('templates')}:</span>
        {TEMPLATES.map((template) => (
          <button
            key={template.id}
            onClick={() => handleLoadTemplate(template.id)}
            className="px-3 py-1 text-xs rounded-full border border-white/10 hover:bg-white/10 transition-colors"
          >
            {t(template.nameKey)}
          </button>
        ))}
      </div>

      {/* Tier List */}
      <div ref={tierListRef} className="rounded-xl overflow-hidden border border-white/10">
        {tiers.map((tier) => (
          <TierRowComponent
            key={tier.id}
            tier={tier}
            isDragging={!!dragItem}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            onClear={handleClearTier}
            onTouchDragStart={handleTouchDragStart}
          />
        ))}
      </div>

      {/* Item Pool */}
      <div className="space-y-4">
        <ImageUploader onAddImages={addImageItems} onAddText={addTextItem} />
        <ItemPool
          items={pool}
          onDragStart={handleDragStart}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onTouchDragStart={handleTouchDragStart}
        />
      </div>
    </div>
  );
}
