function hasOwn(env, key) {
  return Object.prototype.hasOwnProperty.call(env, key);
}

export function onRequestGet(context) {
  const config = {};

  // Prefer ELEKTRON_POOL_* env vars; fall back to PUBLIC_POOL_* for legacy deployments.
  if (hasOwn(context.env, 'ELEKTRON_POOL_API_URL')) {
    config.API_URL = context.env.ELEKTRON_POOL_API_URL;
  } else if (hasOwn(context.env, 'PUBLIC_POOL_API_URL')) {
    config.API_URL = context.env.PUBLIC_POOL_API_URL;
  }

  if (hasOwn(context.env, 'ELEKTRON_POOL_STRATUM_URL')) {
    config.STRATUM_URL = context.env.ELEKTRON_POOL_STRATUM_URL;
  } else if (hasOwn(context.env, 'PUBLIC_POOL_STRATUM_URL')) {
    config.STRATUM_URL = context.env.PUBLIC_POOL_STRATUM_URL;
  }

  return new Response(
    `window.__ELEKTRON_POOL_CONFIG__ = ${JSON.stringify(config)};\n`,
    {
      headers: {
        'content-type': 'application/javascript; charset=utf-8',
        'cache-control': 'no-store'
      }
    }
  );
}
