import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const sempararClient: ClientConfig = {
  id: 'semparar',
  name: 'Sem Parar',
  slug: 'sem-parar',
  datasetId: '90a16a1b-a90b-4d34-a74a-9d4e158c0111',
  workspaceId: 'bc8ccbfa-43e3-4c7a-957f-4f107e333464',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_SEMPARAR' }),
  creativeDax: buildCreativeDax(),
};
