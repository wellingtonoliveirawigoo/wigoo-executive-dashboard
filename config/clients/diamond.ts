import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const diamondClient: ClientConfig = {
  id: 'diamond',
  name: 'Diamond',
  slug: 'diamond',
  datasetId: 'ac4830dc-a50e-4ee8-b35b-0d73c2c492be',
  workspaceId: 'bbd7566a-fca2-4436-b545-28582711ce5a',
  measuresTable: 'fb_campanhas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_DIAMOND' }),
  creativeDax: buildCreativeDax(),
};
