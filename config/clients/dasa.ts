import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const dasaClient: ClientConfig = {
  id: 'dasa',
  name: 'Dasa',
  slug: 'dasa',
  datasetId: 'bf29a0f0-ab9c-480e-a679-a9582d9f7123',
  workspaceId: 'c3fb76f2-b1da-43a9-9d6b-d886b893e6a0',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_DASA' }),
  creativeDax: buildCreativeDax(),
};
