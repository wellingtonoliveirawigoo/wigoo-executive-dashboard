import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const eicoClient: ClientConfig = {
  id: 'eico',
  name: 'Eico',
  slug: 'eico',
  datasetId: 'b97a60cd-42fd-48b2-bfbe-9d364594c40f',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_EICO' }),
  creativeDax: buildCreativeDax(),
};
