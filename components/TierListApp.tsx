'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TEMPLATES } from '../lib/types';

// ── Types ──

interface TierItem {
  id: string;
  label: string;
  image?: string;
}

interface Tier {
  id: string;
  label: string;
  color: string;
  items: TierItem[];
}

// ── Constants ──

const DEFAULT_TIERS: Tier[] = [
  { id: 's', label: 'S', color: '#ff7f7f', items: [] },
  { id: 'a', label: 'A', color: '#ffbf7f', items: [] },
  { id: 'b', label: 'B', color: '#ffdf7f', items: [] },
  { id: 'c', label: 'C', color: '#ffff7f', items: [] },
  { id: 'd', label: 'D', color: '#bfff7f', items: [] },
  { id: 'f', label: 'F', color: '#7fffff', items: [] },
];

const TIER_COLORS = [
  '#ff7f7f', '#ffbf7f', '#ffdf7f', '#ffff7f', '#bfff7f',
  '#7fffff', '#7fbfff', '#7f7fff', '#bf7fff', '#ff7fbf',
  '#ff5555', '#55ff55', '#5555ff', '#ffaa55', '#55ffaa',
];

const STORAGE_KEY = 'tierlist-state';

// ── Persistence ──

function loadState(): { tiers: Tier[]; pool: TierItem[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved.tiers || !saved.pool) return null;
    return saved;
  } catch {
    return null;
  }
}

function saveState(tiers: Tier[], pool: TierItem[]) {
  try {
    // Don't persist blob URLs (images uploaded via file input)
    const clean = (items: TierItem[]) =>
      items.map(({ id, label, image }) => ({
        id,
        label,
        ...(image && !image.startsWith('blob:') ? { image } : {}),
      }));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tiers: tiers.map((t) => ({ ...t, items: clean(t.items) })),
        pool: clean(pool),
      })
    );
  } catch {}
}

// ── Sub-components ──

function SortableItem({ item }: { item: TierItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-[72px] h-[72px] flex items-center justify-center rounded-md cursor-grab active:cursor-grabbing overflow-hidden select-none shrink-0 bg-gray-700 border border-gray-600 hover:border-gray-400 transition-colors"
      title={item.label}
    >
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.image}
          alt={item.label}
          className="w-full h-full object-cover pointer-events-none"
          draggable={false}
        />
      ) : (
        <span className="text-xs text-center px-1 leading-tight break-words font-medium">
          {item.label}
        </span>
      )}
    </div>
  );
}

function ItemOverlay({ item }: { item: TierItem }) {
  return (
    <div className="w-[72px] h-[72px] flex items-center justify-center rounded-md overflow-hidden bg-gray-700 border-2 border-blue-400 shadow-lg shadow-blue-500/30">
      {item.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.image} alt={item.label} className="w-full h-full object-cover" />
      ) : (
        <span className="text-xs text-center px-1">{item.label}</span>
      )}
    </div>
  );
}

function DroppableTierRow({
  tier,
  isOver,
  isFirst,
  isLast,
  onEditLabel,
  onEditColor,
  onDelete,
  children,
}: {
  tier: Tier;
  isOver: boolean;
  isFirst: boolean;
  isLast: boolean;
  onEditLabel: (id: string, label: string) => void;
  onEditColor: (id: string, color: string) => void;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: `tier-${tier.id}` });
  const [editing, setEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className={`flex border-b border-gray-800 min-h-[88px] transition-colors ${
        isOver ? 'bg-gray-800/80' : ''
      } ${isFirst ? 'rounded-t-lg' : ''} ${isLast ? 'rounded-b-lg border-b-0' : ''}`}
    >
      {/* Tier label — click to edit */}
      <div
        className={`w-[88px] shrink-0 flex flex-col items-center justify-center text-2xl font-bold text-black select-none relative group cursor-pointer ${
          isFirst ? 'rounded-tl-lg' : ''
        } ${isLast ? 'rounded-bl-lg' : ''}`}
        style={{ backgroundColor: tier.color }}
        onClick={() => setEditing(true)}
      >
        {editing ? (
          <input
            autoFocus
            className="w-16 text-center text-xl font-bold bg-white/80 text-black rounded px-1 outline-none"
            defaultValue={tier.label}
            onBlur={(e) => {
              onEditLabel(tier.id, e.target.value || tier.label);
              setEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onEditLabel(tier.id, e.currentTarget.value || tier.label);
                setEditing(false);
              }
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span>{tier.label}</span>
        )}

        {/* Hover controls: color + delete */}
        <div className="absolute bottom-0.5 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="w-5 h-5 rounded-full bg-black/30 text-white text-[10px] flex items-center justify-center hover:bg-black/50"
            onClick={(e) => {
              e.stopPropagation();
              setShowColorPicker((v) => !v);
            }}
            title="Change color"
          >
            C
          </button>
          <button
            className="w-5 h-5 rounded-full bg-black/30 text-white text-[10px] flex items-center justify-center hover:bg-red-600/80"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(tier.id);
            }}
            title="Delete tier"
          >
            X
          </button>
        </div>

        {/* Color picker popover */}
        {showColorPicker && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setShowColorPicker(false);
              }}
            />
            <div
              className="absolute top-full left-0 z-50 bg-gray-900 border border-gray-700 rounded-lg p-2 flex flex-wrap gap-1 w-[160px] shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {TIER_COLORS.map((c) => (
                <button
                  key={c}
                  className="w-6 h-6 rounded-full border-2 hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: c,
                    borderColor: c === tier.color ? 'white' : 'transparent',
                  }}
                  onClick={() => {
                    onEditColor(tier.id, c);
                    setShowColorPicker(false);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Items drop zone */}
      <div className="flex-1 flex flex-wrap items-start gap-1.5 p-2 min-h-[88px]">
        {children}
      </div>
    </div>
  );
}

function DroppablePool({
  isOver,
  children,
}: {
  isOver: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: 'pool' });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[88px] flex flex-wrap gap-1.5 p-3 rounded-lg border transition-colors ${
        isOver
          ? 'bg-gray-800/80 border-blue-500/50'
          : 'bg-gray-900/50 border-gray-800'
      }`}
    >
      {children}
    </div>
  );
}

// ── Main Component ──

let nextId = 1;
function genId() {
  return `item-${Date.now()}-${nextId++}`;
}

export default function TierListApp() {
  const t = useTranslations('tool');

  const [tiers, setTiers] = useState<Tier[]>(DEFAULT_TIERS);
  const [pool, setPool] = useState<TierItem[]>([]);
  const [activeItem, setActiveItem] = useState<TierItem | null>(null);
  const [overContainerId, setOverContainerId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const tierListRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } })
  );

  // ── Persistence ──

  useEffect(() => {
    const saved = loadState();
    if (saved) {
      setTiers(saved.tiers);
      setPool(saved.pool);
    }
  }, []);

  useEffect(() => {
    saveState(tiers, pool);
  }, [tiers, pool]);

  // ── Helpers ──

  const findItemLocation = useCallback(
    (itemId: string): { container: 'pool' | string; index: number } | null => {
      const poolIdx = pool.findIndex((i) => i.id === itemId);
      if (poolIdx !== -1) return { container: 'pool', index: poolIdx };
      for (const tier of tiers) {
        const idx = tier.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) return { container: tier.id, index: idx };
      }
      return null;
    },
    [pool, tiers]
  );

  const findItem = useCallback(
    (itemId: string): TierItem | null => {
      const p = pool.find((i) => i.id === itemId);
      if (p) return p;
      for (const tier of tiers) {
        const item = tier.items.find((i) => i.id === itemId);
        if (item) return item;
      }
      return null;
    },
    [pool, tiers]
  );

  const resolveContainerId = (id: string): string | null => {
    if (id === 'pool') return 'pool';
    if (id.startsWith('tier-')) return id.replace('tier-', '');
    const loc = findItemLocation(id);
    return loc ? loc.container : null;
  };

  // ── Drag handlers (dnd-kit) ──

  const handleDragStart = (event: DragStartEvent) => {
    const item = findItem(event.active.id as string);
    setActiveItem(item);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverContainerId(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const fromContainer = resolveContainerId(activeId);
    const toContainer = resolveContainerId(overId);

    setOverContainerId(toContainer);

    if (!fromContainer || !toContainer || fromContainer === toContainer) return;

    const item = findItem(activeId);
    if (!item) return;

    // Remove from source
    if (fromContainer === 'pool') {
      setPool((prev) => prev.filter((i) => i.id !== activeId));
    } else {
      setTiers((prev) =>
        prev.map((t) =>
          t.id === fromContainer
            ? { ...t, items: t.items.filter((i) => i.id !== activeId) }
            : t
        )
      );
    }

    // Add to target
    if (toContainer === 'pool') {
      setPool((prev) => {
        if (prev.some((i) => i.id === activeId)) return prev;
        const overIdx = prev.findIndex((i) => i.id === overId);
        if (overIdx === -1) return [...prev, item];
        const next = [...prev];
        next.splice(overIdx, 0, item);
        return next;
      });
    } else {
      setTiers((prev) =>
        prev.map((t) => {
          if (t.id !== toContainer) return t;
          if (t.items.some((i) => i.id === activeId)) return t;
          const overIdx = t.items.findIndex((i) => i.id === overId);
          if (overIdx === -1) return { ...t, items: [...t.items, item] };
          const next = [...t.items];
          next.splice(overIdx, 0, item);
          return { ...t, items: next };
        })
      );
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    setOverContainerId(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const activeContainer = resolveContainerId(activeId);
    const overContainer = resolveContainerId(overId);

    if (activeContainer && activeContainer === overContainer) {
      if (activeContainer === 'pool') {
        setPool((prev) => {
          const oldIdx = prev.findIndex((i) => i.id === activeId);
          const newIdx = prev.findIndex((i) => i.id === overId);
          if (oldIdx === -1 || newIdx === -1) return prev;
          const next = [...prev];
          const [moved] = next.splice(oldIdx, 1);
          next.splice(newIdx, 0, moved);
          return next;
        });
      } else {
        setTiers((prev) =>
          prev.map((t) => {
            if (t.id !== activeContainer) return t;
            const oldIdx = t.items.findIndex((i) => i.id === activeId);
            const newIdx = t.items.findIndex((i) => i.id === overId);
            if (oldIdx === -1 || newIdx === -1) return t;
            const next = [...t.items];
            const [moved] = next.splice(oldIdx, 1);
            next.splice(newIdx, 0, moved);
            return { ...t, items: next };
          })
        );
      }
    }
  };

  // ── Item actions ──

  const addTextItems = () => {
    if (!textInput.trim()) return;
    const labels = textInput
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const newItems: TierItem[] = labels.map((label) => ({
      id: genId(),
      label,
    }));
    setPool((prev) => [...prev, ...newItems]);
    setTextInput('');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const newItem: TierItem = {
          id: genId(),
          label: file.name.replace(/\.[^.]+$/, ''),
          image: ev.target?.result as string,
        };
        setPool((prev) => [...prev, newItem]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // ── Tier actions ──

  const handleEditTierLabel = (tierId: string, label: string) => {
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, label } : t)));
  };

  const handleEditTierColor = (tierId: string, color: string) => {
    setTiers((prev) => prev.map((t) => (t.id === tierId ? { ...t, color } : t)));
  };

  const handleDeleteTier = (tierId: string) => {
    const tier = tiers.find((t) => t.id === tierId);
    if (!tier) return;
    setPool((prev) => [...prev, ...tier.items]);
    setTiers((prev) => prev.filter((t) => t.id !== tierId));
  };

  const handleAddTier = () => {
    const usedColors = new Set(tiers.map((t) => t.color));
    const nextColor = TIER_COLORS.find((c) => !usedColors.has(c)) || TIER_COLORS[0];
    const newTier: Tier = {
      id: `tier-${Date.now()}`,
      label: 'New',
      color: nextColor,
      items: [],
    };
    setTiers((prev) => [...prev, newTier]);
  };

  // ── Global actions ──

  const handleClearAll = () => {
    setPool([]);
    setTiers(DEFAULT_TIERS.map((t) => ({ ...t, items: [] })));
  };

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

  const handleLoadTemplate = useCallback((templateId: string) => {
    const template = TEMPLATES.find((tmpl) => tmpl.id === templateId);
    if (!template) return;
    const newItems: TierItem[] = template.items.map((name) => ({
      id: genId(),
      label: name,
    }));
    setTiers(DEFAULT_TIERS.map((t) => ({ ...t, items: [] })));
    setPool(newItems);
  }, []);

  // ── Render ──

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Top bar: templates + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
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
          <div className="flex gap-2">
            <button
              onClick={handleClearAll}
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

        {/* Tier rows */}
        <div ref={tierListRef} className="rounded-lg border border-gray-800 overflow-hidden">
          {tiers.map((tier, idx) => (
            <SortableContext
              key={tier.id}
              items={tier.items.map((i) => i.id)}
              strategy={rectSortingStrategy}
            >
              <DroppableTierRow
                tier={tier}
                isOver={overContainerId === tier.id}
                isFirst={idx === 0}
                isLast={idx === tiers.length - 1}
                onEditLabel={handleEditTierLabel}
                onEditColor={handleEditTierColor}
                onDelete={handleDeleteTier}
              >
                {tier.items.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))}
              </DroppableTierRow>
            </SortableContext>
          ))}
        </div>

        {/* Add tier */}
        <button
          onClick={handleAddTier}
          className="w-full py-2 border border-dashed border-gray-700 rounded-lg text-gray-500 hover:text-gray-300 hover:border-gray-500 text-sm transition-colors"
        >
          + {t('addTier')}
        </button>

        {/* Input controls */}
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={t('itemName') + ' (comma or newline separated)'}
              className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  addTextItems();
                }
              }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={addTextItems}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
            >
              {t('addItem')}
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              {t('uploadImages')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Item pool */}
        <div>
          <h3 className="text-sm text-gray-400 mb-2 font-medium">
            {t('pool')} ({pool.length})
          </h3>
          <SortableContext
            items={pool.map((i) => i.id)}
            strategy={rectSortingStrategy}
          >
            <DroppablePool isOver={overContainerId === 'pool'}>
              {pool.length === 0 ? (
                <p className="text-gray-600 text-sm m-auto">{t('noItems')}</p>
              ) : (
                pool.map((item) => (
                  <SortableItem key={item.id} item={item} />
                ))
              )}
            </DroppablePool>
          </SortableContext>
        </div>
      </div>

      <DragOverlay>
        {activeItem ? <ItemOverlay item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
