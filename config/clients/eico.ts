import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const eicoClient: ClientConfig = {
  id: 'eico',
  name: 'Eico',
  slug: 'eico',
  datasetId: 'b97a60cd-42fd-48b2-bfbe-9d364594c40f',
  workspaceId: '1c709d5b-073e-4215-a3e0-9c6cb86881fd',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_EICO' }),
  creativeDax: buildCreativeDax(),
};
