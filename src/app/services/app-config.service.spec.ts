import { AppConfigService } from './app-config.service';

describe('AppConfigService', () => {
  let originalRuntimeConfig: typeof window.__PUBLIC_POOL_CONFIG__;

  beforeEach(() => {
    originalRuntimeConfig = window.__PUBLIC_POOL_CONFIG__;
    delete window.__PUBLIC_POOL_CONFIG__;
  });

  afterEach(() => {
    if (originalRuntimeConfig === undefined) {
      delete window.__PUBLIC_POOL_CONFIG__;
    } else {
      window.__PUBLIC_POOL_CONFIG__ = originalRuntimeConfig;
    }
  });

  it('uses compiled environment values when runtime config is absent', () => {
    const service = new AppConfigService();

    expect(service.apiUrl).toBe('http://localhost:3334');
    expect(service.stratumUrl).toBe('pool.elektron-net.org:3333');
    expect(service.secureStratumUrl).toBe('pool.elektron-net.org:4333');
  });

  it('uses same-origin API requests when runtime API_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      API_URL: ''
    };

    const service = new AppConfigService();

    expect(service.apiUrl).toBe('');
  });

  it('uses the browser hostname when runtime STRATUM_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      STRATUM_URL: ''
    };

    const service = new AppConfigService();

    expect(service.stratumUrl).toBe(`${window.location.hostname}:3333`);
  });

  it('uses the browser hostname when runtime SECURE_STRATUM_URL is explicitly empty', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      SECURE_STRATUM_URL: ''
    };

    const service = new AppConfigService();

    expect(service.secureStratumUrl).toBe(`${window.location.hostname}:4333`);
  });

  it('normalizes a runtime API_URL with trailing slashes', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      API_URL: 'https://example.com///'
    };

    const service = new AppConfigService();

    expect(service.apiUrl).toBe('https://example.com');
  });

  it('renders no block explorer link when BLOCK_EXPLORER_TX_URL is unset', () => {
    const service = new AppConfigService();

    expect(service.blockExplorerTxUrl('abc123')).toBeNull();
  });

  it('substitutes {txid} into a configured BLOCK_EXPLORER_TX_URL', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      BLOCK_EXPLORER_TX_URL: 'https://explorer.example.com/tx/{txid}'
    } as any;

    const service = new AppConfigService();

    expect(service.blockExplorerTxUrl('abc123')).toBe('https://explorer.example.com/tx/abc123');
  });

  it('falls back to the elektron-net-pool repo when SOLO_POOL_URL is unset', () => {
    const service = new AppConfigService();

    expect(service.soloPoolUrl).toBe('https://github.com/kutlusoy/elektron-net-pool');
  });

  it('uses a configured runtime SOLO_POOL_URL', () => {
    window.__PUBLIC_POOL_CONFIG__ = {
      SOLO_POOL_URL: 'https://solo.example.com'
    } as any;

    const service = new AppConfigService();

    expect(service.soloPoolUrl).toBe('https://solo.example.com');
  });
});
