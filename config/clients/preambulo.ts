import { ClientConfig } from './types';
import { buildPerformanceDax } from '../dax/performance';
import { buildCreativeDax } from '../dax/creative';

export const preambuloClient: ClientConfig = {
  id: 'preambulo',
  name: 'Preambulo',
  slug: 'preambulo',
  datasetId: '9a4bfc85-fb4b-4594-91fd-754dcba81d29',
  workspaceId: '8770a877-1385-4e9f-b704-08c8c79cf4e9',
  measuresTable: 'Medidas',
  performanceDax: buildPerformanceDax({ exportTag: 'EXPORT_MOM_PREAMBULO' }),
  creativeDax: buildCreativeDax(),
};
