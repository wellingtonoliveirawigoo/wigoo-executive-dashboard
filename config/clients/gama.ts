import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const gamaClient: ClientConfig = {
  id: 'gama',
  name: 'Gama Italy',
  slug: 'gama-italy',
  datasetId: 'ccd22cca-95b4-49be-89ca-7ef3bc33914f',
  workspaceId: 'd7443495-2eb8-4d36-b3a5-521f017c8c0c',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_GAMA', hasTikTok: true, revenueMode: 'ga4_channel' }),
  creativeDax: buildCreativeDax(),
};
