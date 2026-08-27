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

export interface ITelegramInfo {
  botUsername: string | null;
}

// Same values elektron-net-ppool's MiningJob.ts embeds on-chain as the
// vout[3]/vout[4] OP_RETURN pool-identity outputs (doc-elektron/guideline-pool-identity-op-return.md
// in that repo). Either field is null if the operator hasn't configured it,
// in which case that coinbase output isn't produced at all.
export interface IPoolIdentityInfo {
  name: string | null;
  url: string | null;
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

  public getTelegramInfo(): Observable<ITelegramInfo> {
    return this.httpClient.get<ITelegramInfo>(`${this.appConfig.apiUrl}/api/pool/telegram-info`);
  }

  public getPoolIdentityInfo(): Observable<IPoolIdentityInfo> {
    return this.httpClient.get<IPoolIdentityInfo>(`${this.appConfig.apiUrl}/api/pool/identity`);
  }
}
