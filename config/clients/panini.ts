import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const paniniClient: ClientConfig = {
  id: 'panini',
  name: 'Panini',
  slug: 'panini',
  datasetId: '33df3ce7-69ec-48ac-9603-0721b2ff43a8',
  workspaceId: 'adbb9506-539c-4d23-8006-82214a878d51',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_PANINI' }),
  creativeDax: buildCreativeDax(),
};
