/**
 * TwilioCallManager — Module-level singleton.
 *
 * Problem it solves:
 *   useTwilioDevice() can be called by multiple components, each getting their own
 *   isolated React refs (useRef). That means activeConnectionsMap and incomingConnectionRef
 *   are DIFFERENT objects in each hook instance. The Twilio Device lives in Instance A,
 *   but the UI callbacks (answerCall, rejectCall) run in Instance B → they can't find
 *   the Call objects that Instance A registered.
 *
 * Solution:
 *   Store all Call objects here, at module (singleton) scope. JavaScript modules execute
 *   once and their exports are shared across all imports. All hook instances reference
 *   the exact same TwilioCallManager instance, so they always see the same calls.
 */

import { Call } from '@twilio/voice-sdk';

class TwilioCallManager {
    /** All active / incoming Call objects keyed by their Twilio CallSid */
    private _activeCalls: Map<string, Call> = new Map();

    /** The most recently received incoming Call object that has NOT been accepted yet */
    private _pendingIncomingCall: Call | null = null;

    // ─── Active Calls Map ────────────────────────────────────────────────────

    /**
     * Register a Call object under its SID.
     * Overwrites any existing entry for the same SID (upgrade to latest object).
     */
    setCall(callSid: string, call: Call): void {
        this._activeCalls.set(callSid, call);
    }

    getCall(callSid: string): Call | undefined {
        return this._activeCalls.get(callSid);
    }

    hasCall(callSid: string): boolean {
        return this._activeCalls.has(callSid);
    }

    removeCall(callSid: string): void {
        this._activeCalls.delete(callSid);
    }

    getMapKeys(): string[] {
        return Array.from(this._activeCalls.keys());
    }

    /**
     * Search map values for the first Call whose parameters.CallSid matches.
     * Useful as a fallback when the map key differs from the canonical SID.
     */
    findCallBySid(callSid: string): Call | undefined {
        // Direct key lookup first
        const direct = this._activeCalls.get(callSid);
        if (direct) return direct;

        // Value scan fallback
        for (const [, call] of this._activeCalls.entries()) {
            if (call.parameters?.CallSid === callSid) return call;
        }
        return undefined;
    }

    get allCalls(): Map<string, Call> {
        return this._activeCalls;
    }

    // ─── Pending Incoming Call ────────────────────────────────────────────────

    /**
     * Store the Call object for a currently ringing but not-yet-accepted call.
     * This is used as the final fallback in handleAnswerCall / rejectCall.
     */
    setPendingCall(call: Call | null): void {
        this._pendingIncomingCall = call;
    }

    getPendingCall(): Call | null {
        return this._pendingIncomingCall;
    }

    clearPendingCall(): void {
        this._pendingIncomingCall = null;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    /** Debug snapshot */
    debug(): string {
        return `TwilioCallManager { activeCalls: [${this.getMapKeys().join(', ')}], pending: ${this._pendingIncomingCall?.parameters?.CallSid ?? 'null'} }`;
    }
}

// Export a single shared instance — this is the singleton
export const twilioCallManager = new TwilioCallManager();
