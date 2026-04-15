export type { ClientConfig } from './types';

import { ceaClient }          from './cea';
import { gamaClient }         from './gama';
import { casadatoalhaClient } from './casadatoalha';
import { dabelleClient }      from './dabelle';
import { eicoClient }         from './eico';
import { serasaPmeClient }    from './serasa_pme';
import { b3Client }           from './b3';
import { preambuloClient }    from './preambulo';

export const CLIENTS = [
  ceaClient,
  gamaClient,
  casadatoalhaClient,
  dabelleClient,
  eicoClient,
  serasaPmeClient,
  b3Client,
  preambuloClient,
];
