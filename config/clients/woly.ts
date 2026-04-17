import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const wolyClient: ClientConfig = {
  id: 'woly',
  name: 'Woly',
  slug: 'woly',
  datasetId: '3b0b06b1-8f81-457b-977d-d7fc490ab2fd',
  workspaceId: '126c03ba-b669-4396-b4f0-466a24c5004e',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_WOLY' }),
  creativeDax: buildCreativeDax(),
};
