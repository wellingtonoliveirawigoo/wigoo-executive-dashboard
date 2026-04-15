import { createSign } from 'crypto';

async function getGoogleToken(sa: Record<string, string>): Promise<string> {
  const iat = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/bigquery.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: iat + 3600,
    iat
  })).toString('base64url');

  const toSign = `${header}.${payload}`;
  const sign = createSign('RSA-SHA256');
  sign.update(toSign);
  const sig = sign.sign(sa.private_key, 'base64url');

  const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${toSign}.${sig}`
    })
  });

  if (!tokenResp.ok) {
    const err = await tokenResp.text().catch(() => '');
    throw new Error(`OAuth token error ${tokenResp.status}: ${err}`);
  }
  const data = (await tokenResp.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('OAuth response missing access_token');
  return data.access_token;
}

const ALLOWED_ORIGINS = [
  'https://wigoo-executive-dashboard.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

export default async function handler(req: any, res: any) {
  // Bloqueia origens não autorizadas (previne abuso da quota BigQuery)
  const origin = (req.headers['origin'] as string) || '';
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { queries } = req.body as { queries: string[] };
  if (!queries || !Array.isArray(queries)) {
    return res.status(400).json({ error: 'queries array required' });
  }

  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!saRaw) {
    return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_KEY not configured' });
  }

  let sa: Record<string, string>;
  try {
    sa = JSON.parse(saRaw);
  } catch {
    return res.status(500).json({ error: 'Invalid service account JSON' });
  }

  if (!sa.client_email || !sa.private_key) {
    return res.status(500).json({ error: 'Service account missing client_email or private_key' });
  }

  try {
    const token = await getGoogleToken(sa);

    const results = await Promise.all(
      queries.map(async (query) => {
        const r = await fetch(
          'https://bigquery.googleapis.com/bigquery/v2/projects/power-bi-wigoo/queries',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query, useLegacySql: false, timeoutMs: 30000, location: 'US' })
          }
        );

        const json = (await r.json()) as any;
        if (!r.ok) {
          console.error('BQ query error:', json);
          return [];
        }

        const fields: string[] = (json.schema?.fields || []).map((f: any) => f.name);
        return (json.rows || []).map((row: any) =>
          Object.fromEntries(fields.map((f, i) => [f, row.f[i]?.v]))
        );
      })
    );

    return res.status(200).json({ results });
  } catch (err: any) {
    console.error('BQ handler error:', err);
    return res.status(500).json({ error: String(err?.message || err) });
  }
}
