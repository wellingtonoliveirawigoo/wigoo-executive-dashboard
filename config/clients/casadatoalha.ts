import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const casadatoalhaClient: ClientConfig = {
  id: 'casadatoalha',
  name: 'Casa da Toalha',
  slug: 'casa-da-toalha',
  bqDataset: 'CasaDaToalha',
  datasetId: 'cf6dded6-68aa-46c6-9e2b-295eade30979',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_CASADATOALHA' }),
  creativeDax: buildCreativeDax({ hasValuePurchase: true }),
};
