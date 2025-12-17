import React from 'react';
import './NavigationItemCard.css';

export default function NavigationItemCard({ item, onEdit, onDelete }) {
  const getTypeBadge = (type) => {
    const badges = {
      link: { label: 'Link', color: 'blue' },
      dropdown: { label: 'Dropdown', color: 'purple' }
    };
    return badges[type] || { label: type, color: 'gray' };
  };

  const badge = getTypeBadge(item.type);

  return (
    <div className="navigation-item-card admin-card">
      <div className="navigation-item-header">
        <div className="navigation-item-title-section">
          <h3 className="admin-heading-3">{item.label}</h3>
          <span className={`navigation-type-badge badge-${badge.color}`}>
            {badge.label}
          </span>
        </div>
        <div className="navigation-item-actions">
          <button
            onClick={onEdit}
            className="admin-btn admin-btn-secondary"
            title="Edit"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onDelete}
            className="admin-btn admin-btn-danger"
            title="Delete"
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      <div className="navigation-item-details">
        <div className="detail-row">
          <span className="detail-label">Path:</span>
          <span className="detail-value">{item.path || 'N/A'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-label">Order:</span>
          <span className="detail-value">{item.order}</span>
        </div>
        {item.type === 'dropdown' && (
          <div className="detail-row">
            <span className="detail-label">Items:</span>
            <span className="detail-value">
              {item.items?.length || 0} sub-item{item.items?.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {item.type === 'dropdown' && item.items && item.items.length > 0 && (
        <div className="navigation-item-preview">
          <p className="preview-label">Preview:</p>
          <div className="preview-items">
            {item.items.slice(0, 3).map((subItem, idx) => (
              <span key={idx} className="preview-item">
                {subItem.label}
              </span>
            ))}
            {item.items.length > 3 && (
              <span className="preview-item-more">
                +{item.items.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

