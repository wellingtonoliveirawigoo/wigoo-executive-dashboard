import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const zemaClient: ClientConfig = {
  id: 'zema',
  name: 'Zema',
  slug: 'zema',
  datasetId: '8ac88ae3-4e7f-495f-910e-f54d2f8f628b',
  workspaceId: 'e1b43013-b46d-428b-a032-98c10aa84e71',
  measuresTable: 'fb_campanhas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_ZEMA' }),
  creativeDax: buildCreativeDax(),
};
