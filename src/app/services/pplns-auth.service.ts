import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AppConfigService } from './app-config.service';
import { LocalStorageService } from './local-storage.service';

export interface IAccountSettings {
  payoutThresholdSatsOverride: number | null;
  notifyOnPayout: boolean;
  poolDefaultPayoutThresholdSats: number;
}

// Phase 2 (concept doc §11): signature-based login. There's no
// username/password anywhere -- a miner proves ownership of an address by
// signing a one-time challenge with their own wallet (Bitcoin Core
// signmessage, Electrum, Sparrow, hardware wallets), see README §"Miner
// account API" in elektron-net-ppool for the full flow this wraps.
@Injectable({
  providedIn: 'root'
})
export class PplnsAuthService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService,
    private localStorageService: LocalStorageService,
  ) { }

  public isLoggedIn(address: string): boolean {
    const token = this.localStorageService.getAuthToken(address);
    if (token == null) {
      return false;
    }
    const expiresAt = this.getTokenExpiry(token);
    return expiresAt == null || expiresAt > Date.now();
  }

  public logout(address: string): void {
    this.localStorageService.clearAuthToken(address);
  }

  public async requestChallenge(address: string): Promise<string> {
    const response = await firstValueFrom(this.httpClient.post<{ message: string }>(
      `${this.appConfig.apiUrl}/api/auth/challenge`,
      { address },
    ));
    return response.message;
  }

  public async login(address: string, signature: string): Promise<void> {
    const response = await firstValueFrom(this.httpClient.post<{ accessToken: string }>(
      `${this.appConfig.apiUrl}/api/auth/login`,
      { address, signature },
    ));
    this.localStorageService.setAuthToken(address, response.accessToken);
  }

  public async getAccountSettings(address: string): Promise<IAccountSettings> {
    return await firstValueFrom(this.httpClient.get<IAccountSettings>(
      `${this.appConfig.apiUrl}/api/miner/${address}/account-settings`,
      { headers: this.authHeaders(address) },
    ));
  }

  public async updateAccountSettings(
    address: string,
    changes: { payoutThresholdSatsOverride?: number | null; notifyOnPayout?: boolean },
  ): Promise<IAccountSettings> {
    return await firstValueFrom(this.httpClient.patch<IAccountSettings>(
      `${this.appConfig.apiUrl}/api/miner/${address}/account-settings`,
      changes,
      { headers: this.authHeaders(address) },
    ));
  }

  private authHeaders(address: string): HttpHeaders {
    const token = this.localStorageService.getAuthToken(address);
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  // JWTs are three base64url segments; decode the payload segment just far
  // enough to read `exp` so the UI can show the login form immediately on an
  // expired token instead of waiting for a 401 round trip.
  private getTokenExpiry(token: string): number | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
      return typeof decoded.exp === 'number' ? decoded.exp * 1000 : null;
    } catch {
      return null;
    }
  }
}
