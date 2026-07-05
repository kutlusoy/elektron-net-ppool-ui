import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { IAccountSettings, PplnsAuthService } from '../../services/pplns-auth.service';
import { PplnsService } from '../../services/pplns.service';

type ViewState = 'logged-out' | 'challenge-issued' | 'logged-in';

// Phase 2 (concept doc §11): two independent login methods (signature or
// on-chain proof) + per-miner account settings, embedded in
// SettingsComponent (routed at /app/:address/settings, so the address is
// already known from the route).
@Component({
  selector: 'app-pplns-account-settings',
  templateUrl: './pplns-account-settings.component.html',
  styleUrls: ['./pplns-account-settings.component.scss']
})
export class PplnsAccountSettingsComponent implements OnInit, OnChanges {

  @Input() address!: string;

  public state: ViewState = 'logged-out';
  public busy = false;
  public error: string | null = null;
  public copiedMessage = false;
  public copiedAmount = false;

  public challengeMessage: string | null = null;
  public signatureInput = '';
  public onchainAmountSats: number | null = null;
  public copiedUri = false;

  public settings: IAccountSettings | null = null;
  public useCustomThreshold = false;
  public customThresholdSats: number | null = null;
  public notifyOnPayout = false;

  public telegramBotUsername: string | null = null;

  constructor(
    private pplnsAuthService: PplnsAuthService,
    private pplnsService: PplnsService,
  ) { }

  ngOnInit(): void {
    void this.loadTelegramInfo();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['address'] && this.address) {
      this.resetToCurrentLoginState();
    }
  }

  public async requestChallenge(): Promise<void> {
    this.error = null;
    this.busy = true;
    try {
      const challenge = await this.pplnsAuthService.requestChallenge(this.address);
      this.challengeMessage = challenge.message;
      this.onchainAmountSats = challenge.onchain.amountSats;
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

  // Checks whether the self-send has confirmed yet. A 401 here just means
  // "not seen yet" (or expired) -- surfaced as the normal error message so
  // the user knows to wait and retry, not treated as a hard failure.
  public async checkOnChainPayment(): Promise<void> {
    this.error = null;
    this.busy = true;
    try {
      await this.pplnsAuthService.loginOnChain(this.address);
      await this.loadSettings();
    } catch (e) {
      this.error = this.extractErrorMessage(e, 'Could not verify the on-chain payment.');
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
    this.copyText(this.challengeMessage, () => {
      this.copiedMessage = true;
      setTimeout(() => this.copiedMessage = false, 1500);
    });
  }

  public copyOnChainAmount(): void {
    if (this.onchainAmountSats == null) {
      return;
    }
    this.copyText(String(this.onchainAmountSats), () => {
      this.copiedAmount = true;
      setTimeout(() => this.copiedAmount = false, 1500);
    });
  }

  // BIP21-style payment link (elek:<address>?amount=<ELEK>&label=...) so a
  // wallet's "Open URI" feature (File > Open URI in the Elektron Net GUI
  // wallet) can fill in the self-send address and exact amount in one paste,
  // instead of the user copying the amount and typing the address by hand.
  public get onchainPaymentUri(): string | null {
    if (this.onchainAmountSats == null || !this.address) {
      return null;
    }
    const amountElek = (this.onchainAmountSats / 1e8).toFixed(8);
    const label = encodeURIComponent('Elektron Net PPLNS Pool Login');
    return `elek:${this.address}?amount=${amountElek}&label=${label}`;
  }

  public copyOnChainUri(): void {
    const uri = this.onchainPaymentUri;
    if (uri == null) {
      return;
    }
    this.copyText(uri, () => {
      this.copiedUri = true;
      setTimeout(() => this.copiedUri = false, 1500);
    });
  }

  private copyText(value: string, complete: () => void): void {
    if (window.navigator?.clipboard != null) {
      void window.navigator.clipboard.writeText(value).then(complete, () => { });
      return;
    }
    const input = document.createElement('textarea');
    input.value = value;
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
    this.onchainAmountSats = null;
    if (this.pplnsAuthService.isLoggedIn(this.address)) {
      void this.loadSettings();
    } else {
      this.state = 'logged-out';
    }
  }

  // Cosmetic only -- lets the settings page tell the miner which bot to
  // message with /subscribe. Silently no-ops if the pool hasn't configured
  // TELEGRAM_BOT_USERNAME (or the request fails); the notify-on-payout
  // toggle still works via /subscribe either way.
  private async loadTelegramInfo(): Promise<void> {
    try {
      const info = await firstValueFrom(this.pplnsService.getTelegramInfo());
      this.telegramBotUsername = info.botUsername;
    } catch {
      this.telegramBotUsername = null;
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
