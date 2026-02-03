import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { type Section } from "../../types";
import { DraggableSectionCard } from "./DraggableSectionCard";

interface SectionListProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
  sections,
  onSectionsChange,
}) => {
  // Configure sensors for pointer (mouse/touch) and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts (prevents accidental drags)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end: reorder sections and update order values
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      // Reorder array
      const reordered = arrayMove(sections, oldIndex, newIndex);

      // Update order property to match new positions
      const withUpdatedOrder = reordered.map((section, index) => ({
        ...section,
        order: index,
      }));

      onSectionsChange(withUpdatedOrder);
    }
  };

  // Toggle section enabled/disabled
  const handleToggle = (id: string) => {
    const updated = sections.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    onSectionsChange(updated);
  };

  // Sort by order for display
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  // Only enabled sections are sortable
  const sortableIds = sortedSections.filter((s) => s.enabled).map((s) => s.id);

  return (
    <div className="space-y-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortableIds}
          strategy={verticalListSortingStrategy}
        >
          {sortedSections.map((section) => (
            <DraggableSectionCard
              key={section.id}
              section={section}
              onToggle={handleToggle}
            />
          ))}
        </SortableContext>
      </DndContext>

      <p className="text-xs text-gray-400 pt-2">
        Drag enabled sections to reorder. Disabled sections stay in place.
      </p>
    </div>
  );
};
