import { AbstractControl, ValidatorFn } from '@angular/forms';
import { validate } from 'bitcoin-address-validation';

// Bech32 character set per BIP-0173.
const BECH32_CHARSET = /^[02-9ac-hj-np-z]+$/;

// Accept any Bech32 HRP (Bitcoin `bc`/`tb`/`bcrt` or Elektron `be`/`bert`)
// by sniffing the `1` separator. Real validation happens server-side; this is
// a UX hint to avoid obviously wrong addresses in the worker lookup field.
function isPlausibleBech32(value: string): boolean {
    if (typeof value !== 'string' || value.length < 14 || value.length > 90) {
        return false;
    }
    const lower = value.toLowerCase();
    const sep = lower.lastIndexOf('1');
    if (sep < 1 || sep + 7 > lower.length) {
        return false;
    }
    const hrp = lower.slice(0, sep);
    const data = lower.slice(sep + 1);
    if (!/^[a-z]{2,5}$/.test(hrp)) {
        return false;
    }
    return BECH32_CHARSET.test(data);
}

export function bitcoinAddressValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const value = control.value;
        if (isPlausibleBech32(value) || validate(value)) {
            return null;
        }
        return { ['bitcoin-address']: true };
    };
}
