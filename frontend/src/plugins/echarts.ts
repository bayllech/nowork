import { use } from 'echarts/core';
import { MapChart, BarChart } from 'echarts/charts';
import {
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  TitleComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

use([
  MapChart,
  BarChart,
  TooltipComponent,
  VisualMapComponent,
  GeoComponent,
  TitleComponent,
  LegendComponent,
  GridComponent,
  CanvasRenderer
]);
