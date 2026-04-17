export type { ClientConfig } from './types';

import { ceaClient }           from './cea';
import { gamaClient }          from './gama';
import { casadatoalhaClient }  from './casadatoalha';
import { dabelleClient }       from './dabelle';
import { eicoClient }          from './eico';
import { serasaPmeClient }     from './serasa_pme';
import { b3Client }            from './b3';
import { preambuloClient }     from './preambulo';
import { dasaClient }          from './dasa';
import { redeamericasClient }  from './redeamericas';
import { paniniClient }        from './panini';
import { sempararClient }      from './semparar';
import { diamondClient }       from './diamond';
import { colomboClient }       from './colombo';
import { zemaClient }          from './zema';
import { wolyClient }          from './woly';
import { soulierClient }       from './soulier';

export const CLIENTS = [
  // Clientes originais
  ceaClient,
  gamaClient,
  casadatoalhaClient,
  dabelleClient,
  eicoClient,
  serasaPmeClient,
  b3Client,
  preambuloClient,
  // Novos clientes
  dasaClient,
  redeamericasClient,
  paniniClient,
  sempararClient,
  diamondClient,
  colomboClient,
  zemaClient,
  wolyClient,
  soulierClient,
];
