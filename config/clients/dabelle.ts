import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const dabelleClient: ClientConfig = {
  id: 'dabelle',
  name: 'Dabelle',
  slug: 'dabelle',
  datasetId: '027b28bb-3e26-4aee-97a4-a4324e95ca35',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_DABELLE' }),
  creativeDax: buildCreativeDax(),
};
