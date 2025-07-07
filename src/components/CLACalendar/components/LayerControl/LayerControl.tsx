import React from 'react';
import { LayerControlProps } from './LayerControl.types';
import './LayerControl.css';

export const LayerControl: React.FC<LayerControlProps> = ({ 
  layers, 
  activeLayer, 
  onLayerChange 
}) => {
  return (
    <div className="cla-layer-control">
      {layers
        .filter(layer => layer.visible !== false)
        .map(layer => (
          <button
            key={layer.name}
            onClick={() => onLayerChange(layer.name)}
            className={`cla-layer-button ${activeLayer === layer.name ? 'active' : ''}`}
          >
            {layer.title}
          </button>
        ))}
    </div>
  );
};