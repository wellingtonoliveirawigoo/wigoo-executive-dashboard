import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const soulierClient: ClientConfig = {
  id: 'soulier',
  name: 'Soulier',
  slug: 'soulier',
  datasetId: 'a7e6625f-6a99-427c-b03c-12a0e7fcc169',
  workspaceId: '8c841c07-1ce0-4ec1-afc1-c214e8401fe9',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_SOULIER' }),
  creativeDax: buildCreativeDax(),
};
