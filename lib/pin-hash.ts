/**
 * Simple PIN hashing utility using Web Crypto API (SHA-256).
 * 
 * This provides basic protection for stored PINs — they're no longer plaintext
 * in localStorage/Supabase. Note: For a children's educational app, this level
 * of security is appropriate. For financial-grade security, use bcrypt + server-side only.
 */

const SALT_PREFIX = 'superkids_v1_';

/**
 * Hash a PIN using SHA-256 (async, uses native Web Crypto).
 * Returns a hex string.
 */
export async function hashPin(pin: string): Promise<string> {
    const data = new TextEncoder().encode(SALT_PREFIX + pin.trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPinIfNeeded(pin?: string | null): Promise<string | undefined> {
    const normalizedPin = pin?.trim();
    if (!normalizedPin) return undefined;
    return isPinHashed(normalizedPin) ? normalizedPin : hashPin(normalizedPin);
}

/**
 * Verify a PIN against a stored hash.
 * Supports backward compatibility: if storedHash looks like a raw PIN
 * (short numeric string, not 64-char hex), compare directly.
 */
export async function verifyPin(inputPin: string, storedHash: string): Promise<boolean> {
    // Backward compatibility: old PINs stored as plaintext (4-8 digit numbers)
    if (storedHash.length <= 8 && /^\d+$/.test(storedHash)) {
        return inputPin.trim() === storedHash.trim();
    }

    const inputHash = await hashPin(inputPin);
    return inputHash === storedHash;
}

export async function verifyPinInput(inputOrHash: string, storedHash: string): Promise<boolean> {
    const provided = inputOrHash?.trim() || '';
    const stored = storedHash?.trim() || '';

    if (!provided || !stored) {
        return false;
    }

    if (isPinHashed(provided) && provided === stored) {
        return true;
    }

    return verifyPin(provided, stored);
}

/**
 * Check if a stored PIN value is already hashed (64-char hex = SHA-256 hash).
 */
export function isPinHashed(pin: string): boolean {
    return pin.length === 64 && /^[a-f0-9]+$/.test(pin);
}
