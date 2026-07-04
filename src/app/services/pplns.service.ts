import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AppConfigService } from './app-config.service';

export interface IPendingBalance {
  pendingSats: number;
  lastPayoutAt: string | null;
  totalPaidSats: number;
}

export interface IPayoutHistoryEntry {
  blockHeight: number;
  amountSats: number;
  txid: string | null;
  status: 'PENDING' | 'SENT' | 'CONFIRMED';
  timestamp: string;
}

export interface IPplnsWindowStats {
  windowMinutes: number;
  totalDifficultyInWindow: number;
  activeMinerCount: number;
}

export interface IFeeInfo {
  feePercent: number;
  minPayoutThresholdSats: number;
  payoutIntervalMinutes: number;
}

// Thin wrappers over the elektron-net-ppool backend's PPLNS endpoints
// (concept doc §10.3). Kept separate from ClientService since these are
// PPLNS-specific and don't exist on the solo pool's API.
@Injectable({
  providedIn: 'root'
})
export class PplnsService {

  constructor(
    private httpClient: HttpClient,
    private appConfig: AppConfigService
  ) { }

  public getPendingBalance(address: string): Observable<IPendingBalance> {
    return this.httpClient.get<IPendingBalance>(`${this.appConfig.apiUrl}/api/miner/${address}/pending-balance`);
  }

  public getPayoutHistory(address: string): Observable<IPayoutHistoryEntry[]> {
    return this.httpClient.get<IPayoutHistoryEntry[]>(`${this.appConfig.apiUrl}/api/miner/${address}/payout-history`);
  }

  public getPplnsWindowStats(): Observable<IPplnsWindowStats> {
    return this.httpClient.get<IPplnsWindowStats>(`${this.appConfig.apiUrl}/api/pool/pplns-window-stats`);
  }

  public getFeeInfo(): Observable<IFeeInfo> {
    return this.httpClient.get<IFeeInfo>(`${this.appConfig.apiUrl}/api/pool/fee-info`);
  }
}
