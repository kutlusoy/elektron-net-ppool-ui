import { Component } from '@angular/core';

import { AppConfigService } from '../../services/app-config.service';

// Concept doc §10.4 "Solo vs. PPLNS pool switcher/banner": both pools run in
// parallel, so this makes explicit which one the miner is looking at and
// links to the other. The target domain/port (doc §8.5) is an open product
// decision, so it's configurable rather than hardcoded — falls back to the
// solo pool's GitHub repo when no SOLO_POOL_URL is configured.
@Component({
  selector: 'app-pool-mode-banner',
  templateUrl: './pool-mode-banner.component.html',
  styleUrls: ['./pool-mode-banner.component.scss']
})
export class PoolModeBannerComponent {

  constructor(
    private appConfig: AppConfigService
  ) { }

  public get soloPoolUrl(): string {
    return this.appConfig.soloPoolUrl;
  }
}
