/**
 * Helper to get or generate a persistent device ID.
 * This is stored in localStorage to distinguish multiple devices
 * using the same account for local conflict resolution.
 */
export const getDeviceId = (): string => {
    if (typeof window === 'undefined') return 'server';
    
    let deviceId = localStorage.getItem("math_device_id");
    if (!deviceId) {
        // DEV-[timestamp]-[random-string]
        deviceId = `DEV-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
        localStorage.setItem("math_device_id", deviceId);
    }
    return deviceId;
};
