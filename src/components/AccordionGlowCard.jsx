import React from 'react';

/**
 * Accordion Glow Expansion Component
 * Border Color: #26658c
 * Animation Name: Accordion Glow Expansion
 */
export default function AccordionGlowCard({ items = [], activeId, onSelect }) {
  const defaultItems = [
    { id: 'all', label: 'ALL' },
    { id: 'watching', label: 'WATCHING' },
    { id: 'not-started', label: 'NOT STARTED' },
    { id: 'completed', label: 'COMPLETED' },
  ];

  const list = items.length > 0 ? items : defaultItems;

  return (
    <div className="accordion-glow-container">
      {list.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect && onSelect(item.id)}
            className={`accordion-glow-tab ${isActive ? 'active' : ''}`}
            style={{ borderColor: '#26658c' }}
          >
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
