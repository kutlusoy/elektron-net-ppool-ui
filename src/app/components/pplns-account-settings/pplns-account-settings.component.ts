import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { IAccountSettings, PplnsAuthService } from '../../services/pplns-auth.service';

type ViewState = 'logged-out' | 'challenge-issued' | 'logged-in';

// Phase 2 (concept doc §11): signature-based login + per-miner account
// settings, embedded in SettingsComponent (routed at /app/:address/settings,
// so the address is already known from the route).
@Component({
  selector: 'app-pplns-account-settings',
  templateUrl: './pplns-account-settings.component.html',
  styleUrls: ['./pplns-account-settings.component.scss']
})
export class PplnsAccountSettingsComponent implements OnChanges {

  @Input() address!: string;

  public state: ViewState = 'logged-out';
  public busy = false;
  public error: string | null = null;
  public copiedMessage = false;

  public challengeMessage: string | null = null;
  public signatureInput = '';

  public settings: IAccountSettings | null = null;
  public useCustomThreshold = false;
  public customThresholdSats: number | null = null;
  public notifyOnPayout = false;

  constructor(private pplnsAuthService: PplnsAuthService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.address) {
      this.resetToCurrentLoginState();
    }
  }

  public async requestChallenge(): Promise<void> {
    this.error = null;
    this.busy = true;
    try {
      this.challengeMessage = await this.pplnsAuthService.requestChallenge(this.address);
      this.signatureInput = '';
      this.state = 'challenge-issued';
    } catch (e) {
      this.error = this.extractErrorMessage(e, 'Could not request a login challenge.');
    } finally {
      this.busy = false;
    }
  }

  public async login(): Promise<void> {
    if (!this.signatureInput.trim()) {
      this.error = 'Paste the signature produced by your wallet first.';
      return;
    }

    this.error = null;
    this.busy = true;
    try {
      await this.pplnsAuthService.login(this.address, this.signatureInput.trim());
      await this.loadSettings();
    } catch (e) {
      this.error = this.extractErrorMessage(e, 'Login failed -- check the signature and try again.');
    } finally {
      this.busy = false;
    }
  }

  public logout(): void {
    this.pplnsAuthService.logout(this.address);
    this.resetToCurrentLoginState();
  }

  public async save(): Promise<void> {
    this.error = null;
    this.busy = true;
    try {
      this.settings = await this.pplnsAuthService.updateAccountSettings(this.address, {
        payoutThresholdSatsOverride: this.useCustomThreshold ? this.customThresholdSats : null,
        notifyOnPayout: this.notifyOnPayout,
      });
    } catch (e) {
      this.error = this.extractErrorMessage(e, 'Could not save account settings.');
      if (this.isUnauthorized(e)) {
        this.pplnsAuthService.logout(this.address);
        this.state = 'logged-out';
      }
    } finally {
      this.busy = false;
    }
  }

  public copyMessage(): void {
    if (this.challengeMessage == null) {
      return;
    }
    const complete = () => {
      this.copiedMessage = true;
      setTimeout(() => this.copiedMessage = false, 1500);
    };
    if (window.navigator?.clipboard != null) {
      void window.navigator.clipboard.writeText(this.challengeMessage).then(complete, () => { });
      return;
    }
    const input = document.createElement('textarea');
    input.value = this.challengeMessage;
    input.setAttribute('readonly', 'true');
    input.style.position = 'fixed';
    input.style.opacity = '0';
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      complete();
    } finally {
      document.body.removeChild(input);
    }
  }

  private resetToCurrentLoginState(): void {
    this.error = null;
    this.challengeMessage = null;
    this.signatureInput = '';
    if (this.pplnsAuthService.isLoggedIn(this.address)) {
      void this.loadSettings();
    } else {
      this.state = 'logged-out';
    }
  }

  private async loadSettings(): Promise<void> {
    this.busy = true;
    try {
      this.settings = await this.pplnsAuthService.getAccountSettings(this.address);
      this.useCustomThreshold = this.settings.payoutThresholdSatsOverride != null;
      this.customThresholdSats = this.settings.payoutThresholdSatsOverride ?? this.settings.poolDefaultPayoutThresholdSats;
      this.notifyOnPayout = this.settings.notifyOnPayout;
      this.state = 'logged-in';
    } catch (e) {
      this.error = this.extractErrorMessage(e, 'Could not load account settings.');
      if (this.isUnauthorized(e)) {
        this.pplnsAuthService.logout(this.address);
        this.state = 'logged-out';
      }
    } finally {
      this.busy = false;
    }
  }

  private isUnauthorized(e: any): boolean {
    return e?.status === 401;
  }

  private extractErrorMessage(e: any, fallback: string): string {
    return e?.error?.message ?? e?.message ?? fallback;
  }
}
