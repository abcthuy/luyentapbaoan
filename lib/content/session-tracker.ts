const MAX_RECENT_GENERATOR = 60;
const MAX_RECENT_GLOBAL_GENERATOR = 180;
const MAX_RECENT_STATIC = 100;
const MAX_RECENT_GLOBAL_STATIC = 240;

class SessionTracker {
    private recentGeneratorFingerprints = new Set<string>();
    private recentGlobalGeneratorFingerprints = new Set<string>();
    
    private recentStaticIds = new Set<string>();
    private recentGlobalStaticIds = new Set<string>();

    public resetSession() {
        this.recentGeneratorFingerprints.clear();
        this.recentStaticIds.clear();
    }

    // --- Generator Tracking ---
    public hasGenerator(fingerprint: string): boolean {
        return this.recentGeneratorFingerprints.has(fingerprint) || this.recentGlobalGeneratorFingerprints.has(fingerprint);
    }

    public addGenerator(fingerprint: string) {
        if (this.recentGeneratorFingerprints.size >= MAX_RECENT_GENERATOR) {
            this.recentGeneratorFingerprints.clear();
        }
        if (this.recentGlobalGeneratorFingerprints.size >= MAX_RECENT_GLOBAL_GENERATOR) {
            this.recentGlobalGeneratorFingerprints.clear();
        }
        this.recentGeneratorFingerprints.add(fingerprint);
        this.recentGlobalGeneratorFingerprints.add(fingerprint);
    }

    // --- Static Tracking ---
    public hasStatic(id: string, includeGlobal = true): boolean {
        if (includeGlobal) {
            return this.recentStaticIds.has(id) || this.recentGlobalStaticIds.has(id);
        }
        return this.recentStaticIds.has(id);
    }

    public addStatic(id: string) {
        if (this.recentStaticIds.size >= MAX_RECENT_STATIC) {
            this.recentStaticIds.clear();
        }
        if (this.recentGlobalStaticIds.size >= MAX_RECENT_GLOBAL_STATIC) {
            this.recentGlobalStaticIds.clear();
        }
        this.recentStaticIds.add(id);
        this.recentGlobalStaticIds.add(id);
    }

    public deleteStatic(id: string) {
        this.recentStaticIds.delete(id);
    }
}

export const sessionTracker = new SessionTracker();
