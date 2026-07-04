import { Injectable } from '@angular/core';

import { environment } from '../../environments/environment';

interface RuntimeConfig {
  API_URL?: string;
  STRATUM_URL?: string;
  SECURE_STRATUM_URL?: string;
}

declare global {
  interface Window {
    __ELEKTRON_POOL_CONFIG__?: RuntimeConfig;
    // Legacy global from the upstream Public Pool fork; still honoured for
    // deployments that have not regenerated runtime-config.js yet.
    __PUBLIC_POOL_CONFIG__?: RuntimeConfig;
  }
}

function runtimeConfig(): RuntimeConfig | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  return window.__ELEKTRON_POOL_CONFIG__ ?? window.__PUBLIC_POOL_CONFIG__;
}

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {

  public get apiUrl(): string {
    if (this.hasRuntimeValue('API_URL')) {
      return this.normalizeBaseUrl(runtimeConfig()?.API_URL);
    }

    return this.normalizeBaseUrl(environment.API_URL);
  }

  public get stratumUrl(): string {
    if (this.hasRuntimeValue('STRATUM_URL')) {
      return this.resolveStratumUrl(runtimeConfig()?.STRATUM_URL);
    }

    return this.resolveStratumUrl(environment.STRATUM_URL);
  }

  public get secureStratumUrl(): string {
    if (this.hasRuntimeValue('SECURE_STRATUM_URL')) {
      return this.resolveSecureStratumUrl(runtimeConfig()?.SECURE_STRATUM_URL);
    }

    return this.resolveSecureStratumUrl(environment.SECURE_STRATUM_URL);
  }

  private hasRuntimeValue(key: keyof RuntimeConfig): boolean {
    const cfg = runtimeConfig();
    return !!cfg && Object.prototype.hasOwnProperty.call(cfg, key);
  }

  private normalizeBaseUrl(value: string | undefined): string {
    return (value ?? '').trim().replace(/\/+$/, '');
  }

  private resolveStratumUrl(value: string | undefined): string {
    const configured = (value ?? '').trim();
    if (configured.length > 0) {
      return configured;
    }

    if (typeof window === 'undefined') {
      return 'localhost:3333';
    }

    return `${window.location.hostname}:3333`;
  }

  private resolveSecureStratumUrl(value: string | undefined): string {
    const configured = (value ?? '').trim();
    if (configured.length > 0) {
      return configured;
    }

    if (typeof window === 'undefined') {
      return 'localhost:4333';
    }

    return `${window.location.hostname}:4333`;
  }
}
