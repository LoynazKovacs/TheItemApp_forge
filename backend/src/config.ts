export interface AppConfig {
  port: number;
  coreApiUrl: string;
  coreApiKey: string | null;
  appKey: string;
  appRegistrationKey: string | null;
  registrationBaseUrl: string;
  registrationHeartbeatMs: number;
}

function parseInt0(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export function getConfig(): AppConfig {
  const port = parseInt0(process.env.FORGE_API_PORT, 3011);
  const appKey = (process.env.FORGE_APP_KEY ?? '').trim() || 'forge';

  return {
    port,
    coreApiUrl: (process.env.CORE_API_URL ?? '').trim() || 'http://backend:3001',
    coreApiKey: (process.env.FORGE_CORE_API_KEY ?? '').trim() || null,
    appKey,
    appRegistrationKey: (process.env.APP_REGISTRATION_KEY ?? '').trim() || null,
    registrationBaseUrl: (process.env.FORGE_REGISTRATION_BASE_URL ?? '').trim() || `http://forge-api:${port}`,
    registrationHeartbeatMs: parseInt0(process.env.FORGE_REGISTRATION_HEARTBEAT_MS, 5 * 60 * 1000),
  };
}
