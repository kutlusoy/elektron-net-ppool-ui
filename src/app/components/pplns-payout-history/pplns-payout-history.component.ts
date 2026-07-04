import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { AppConfigService } from '../../services/app-config.service';
import { IPayoutHistoryEntry, PplnsService } from '../../services/pplns.service';

// Concept doc §10.4 "Payout history table".
@Component({
  selector: 'app-pplns-payout-history',
  templateUrl: './pplns-payout-history.component.html',
  styleUrls: ['./pplns-payout-history.component.scss']
})
export class PplnsPayoutHistoryComponent implements OnChanges {

  @Input() address!: string;

  public history$!: Observable<IPayoutHistoryEntry[]>;

  constructor(
    private pplnsService: PplnsService,
    private appConfig: AppConfigService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.address) {
      this.history$ = this.pplnsService.getPayoutHistory(this.address).pipe(
        shareReplay({ refCount: true, bufferSize: 1 })
      );
    }
  }

  public explorerUrl(txid: string): string | null {
    return this.appConfig.blockExplorerTxUrl(txid);
  }
}
