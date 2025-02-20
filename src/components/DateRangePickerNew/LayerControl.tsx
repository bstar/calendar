import React from 'react';
import { Layer } from './layers/types';
import './LayerControl.css';

/**
 * Props for the LayerControl component.
 * 
 * Properties:
 * - layers: Array of Layer objects to display as toggleable buttons
 * - activeLayer: ID of the currently active layer
 * - onLayerChange: Callback function when a layer button is clicked
 */
interface LayerControlProps {
  layers: Layer[];
  activeLayer: string;
  onLayerChange: (layerId: string) => void;
}

/**
 * LayerControl component provides a button group for switching between different
 * calendar visualization layers. Each layer represents a different way to display
 * or interact with the calendar data (e.g., events, backgrounds, etc.).
 * 
 * Features:
 * - Filters out invisible layers
 * - Highlights the active layer
 * - Provides visual feedback on hover and active states
 * - Maintains consistent styling with the calendar theme
 * 
 * @param props - Component properties (see LayerControlProps interface)
 * @returns React component
 */
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