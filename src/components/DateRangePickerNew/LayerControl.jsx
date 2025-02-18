import React from 'react';
import PropTypes from 'prop-types';

const LayerControl = ({
  layers,
  activeLayer,
  onLayerChange
}) => {
  return (
    <div className="cla-layer-control" style={{
      padding: '12px 16px',
      borderTop: '1px solid #dee2e6',
      display: 'flex',
      gap: '8px'
    }}>
      {layers.map(layer => (
        <button
          key={layer.id}
          onClick={() => onLayerChange(layer.id)}
          className={`cla-layer-button ${activeLayer === layer.id ? 'active' : ''}`}
          style={{
            padding: '6px 12px',
            borderRadius: '4px',
            border: '1px solid #dee2e6',
            backgroundColor: activeLayer === layer.id ? '#e7f3ff' : '#fff',
            color: activeLayer === layer.id ? '#0366d6' : '#666',
            cursor: 'pointer'
          }}
        >
          {layer.name}
        </button>
      ))}
    </div>
  );
};

export default LayerControl; 