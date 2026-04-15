import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const colomboClient: ClientConfig = {
  id: 'colombo',
  name: 'Lojas Colombo',
  slug: 'colombo',
  datasetId: 'e518478e-7a08-42d7-92e6-eb7819dd2ff6',
  workspaceId: 'ed2aab6d-1558-4b1a-9340-d6d94026ca07',
  measuresTable: 'fb_campanhas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_COLOMBO' }),
  creativeDax: buildCreativeDax(),
};
