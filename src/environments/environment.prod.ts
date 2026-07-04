export const environment = {
    production: true,
    // Empty means "same-origin, relative /api" (see AppConfigService.apiUrl)
    // and "this page's own hostname" for the Stratum URLs (see
    // resolveStratumUrl/resolveSecureStratumUrl) -- the only default that
    // works out of the box for a self-hosted deployment without also
    // requiring PUBLIC_POOL_API_URL/PUBLIC_POOL_STRATUM_URL to be set.
    // Override via runtime-config (see docker/entrypoint.sh) for a real
    // production deployment with its own domain.
    API_URL: '',
    STRATUM_URL: '',
    SECURE_STRATUM_URL: '',
    BLOCK_EXPLORER_TX_URL: ''
};
