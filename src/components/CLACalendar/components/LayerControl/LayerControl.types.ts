import { Layer } from '../../../CLACalendar.config';

export interface LayerControlProps {
  layers: Layer[];
  activeLayer: string;
  onLayerChange: (layerName: string) => void;
}