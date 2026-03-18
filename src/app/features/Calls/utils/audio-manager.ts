/**
 * Audio Manager for handling call sounds
 * This utility manages ringtones, call sounds, and other audio notifications
 */

class AudioManager {
    private ringtone: HTMLAudioElement | null = null;
    private callEndSound: HTMLAudioElement | null = null;
    private dialToneSound: HTMLAudioElement | null = null;
    private dtmfTones: Map<string, HTMLAudioElement> = new Map();
    private isMuted = false;
    private isRingtonePlaying = false;
    private isDialTonePlaying = false;
    private audioContext: AudioContext | null = null;
    private isInitialized = false;

    constructor() {
        if (typeof window !== 'undefined') {
            this.initAudio();
        }
    }

    private async initAudio() {
        try {
            // Initialize AudioContext for better browser compatibility
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Create audio elements with better error handling
            this.ringtone = this.createAudioElement('/sounds/ringtone.mp3', true, 0.7);
            this.callEndSound = this.createAudioElement('/sounds/call-end.mp3', false, 0.7);
            this.dialToneSound = this.createAudioElement('/sounds/dial-tone.mp3', true, 0.3);

            // Create DTMF tones
            const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '#'];
            digits.forEach((digit) => {
                const audio = this.createAudioElement(`https://sdk.twilio.com/js/client/sounds/releases/1.0.0/dtmf-${digit}.mp3?cache=1.13.1`, false, 0.5);
                if (audio) {
                    this.dtmfTones.set(digit, audio);
                }
            });

            this.isInitialized = true;
        } catch (error) {
            console.warn('Audio initialization failed, using fallback mode:', error);
            this.initFallbackAudio();
        }
    }

    private createAudioElement(src: string, loop: boolean, volume: number): HTMLAudioElement | null {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = loop;
            audio.volume = volume;

            // Handle loading errors gracefully
            audio.addEventListener('error', (e) => {
                console.warn(`Failed to load audio file: ${src}`, e);
            });

            audio.addEventListener('canplaythrough', () => {
                // Audio is ready to play
            });

            // Set source after event listeners are attached
            audio.src = src;

            return audio;
        } catch (error) {
            console.warn(`Failed to create audio element for ${src}:`, error);
            return null;
        }
    }

    private initFallbackAudio() {
        // Fallback mode without actual audio files
        console.log('Running in audio fallback mode - no sounds will play');
        this.isInitialized = true;
    }

    private async ensureAudioContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (error) {
                console.warn('Failed to resume audio context:', error);
            }
        }
    }

    private async safePlay(audio: HTMLAudioElement | null, trackingFlag?: { current: boolean }): Promise<boolean> {
        if (!audio || this.isMuted) return false;

        try {
            // Ensure audio context is active
            await this.ensureAudioContext();

            // Reset audio to beginning
            audio.currentTime = 0;

            // Set tracking flag before playing
            if (trackingFlag) {
                trackingFlag.current = true;
            }

            // Attempt to play
            const playPromise = audio.play();

            if (playPromise !== undefined) {
                await playPromise;
                return true;
            }

            return false;
        } catch (error) {
            // Handle specific play interruption errors
            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.log('Audio play was aborted (likely due to rapid play/pause)');
                } else if (error.name === 'NotAllowedError') {
                    console.log('Audio play not allowed (user interaction required)');
                } else {
                    console.warn('Audio play failed:', error.message);
                }
            }

            // Reset tracking flag on error
            if (trackingFlag) {
                trackingFlag.current = false;
            }

            return false;
        }
    }

    private safeStop(audio: HTMLAudioElement | null, trackingFlag?: { current: boolean }): void {
        if (!audio) return;

        try {
            // Set tracking flag before stopping
            if (trackingFlag) {
                trackingFlag.current = false;
            }

            // Only pause if not already paused
            if (!audio.paused) {
                audio.pause();
            }

            // Reset to beginning
            audio.currentTime = 0;
        } catch (error) {
            console.warn('Audio stop failed:', error);
        }
    }

    public async playRingtone(): Promise<void> {
        if (!this.isInitialized || this.isRingtonePlaying) return;

        const success = await this.safePlay(this.ringtone, { current: this.isRingtonePlaying });
        if (success) {
            this.isRingtonePlaying = true;
        }
    }

    public stopRingtone(): void {
        if (!this.isRingtonePlaying) return;

        this.safeStop(this.ringtone);
        this.isRingtonePlaying = false;
    }

    public async playCallEndSound(): Promise<void> {
        if (!this.isInitialized) return;

        await this.safePlay(this.callEndSound);
    }

    public async playDialTone(): Promise<void> {
        if (!this.isInitialized || this.isDialTonePlaying) return;

        const success = await this.safePlay(this.dialToneSound, { current: this.isDialTonePlaying });
        if (success) {
            this.isDialTonePlaying = true;
        }
    }

    public stopDialTone(): void {
        if (!this.isDialTonePlaying) return;

        this.safeStop(this.dialToneSound);
        this.isDialTonePlaying = false;
    }

    public async playDTMF(digit: string): Promise<void> {
        // DTMF playback is now handled natively by Twilio Device. This method is deprecated.
        const audio = this.dtmfTones.get(digit);
        if (audio) {
            await this.safePlay(audio);
        } else {
            console.warn(`DTMF tone for digit "${digit}" not found.`);
            // Example: Play a back button sound or fallback sound
            const audio = this.createAudioElement(`https://sdk.twilio.com/js/client/sounds/releases/1.0.0/dtmf-5.mp3?cache=1.13.1`, false, 0.5);
            if (audio) {
                await this.safePlay(audio);
            }
        }
        return;
    }

    public setMuted(muted: boolean): void {
        this.isMuted = muted;
        if (muted) {
            this.stopRingtone();
            this.stopDialTone();
        }
    }

    public async preloadSounds(): Promise<void> {
        if (!this.isInitialized) return;

        // Preload all sounds to prevent delays when playing
        const loadPromises: Promise<void>[] = [];

        if (this.ringtone) {
            loadPromises.push(this.loadAudio(this.ringtone));
        }
        if (this.callEndSound) {
            loadPromises.push(this.loadAudio(this.callEndSound));
        }
        if (this.dialToneSound) {
            loadPromises.push(this.loadAudio(this.dialToneSound));
        }

        this.dtmfTones.forEach((audio) => {
            loadPromises.push(this.loadAudio(audio));
        });

        try {
            await Promise.allSettled(loadPromises);
        } catch (error) {
            console.warn('Some audio files failed to preload:', error);
        }
    }

    private loadAudio(audio: HTMLAudioElement): Promise<void> {
        return new Promise((resolve) => {
            if (audio.readyState >= 3) {
                // Already loaded
                resolve();
                return;
            }

            const onLoad = () => {
                audio.removeEventListener('canplaythrough', onLoad);
                audio.removeEventListener('error', onError);
                resolve();
            };

            const onError = () => {
                audio.removeEventListener('canplaythrough', onLoad);
                audio.removeEventListener('error', onError);
                resolve(); // Resolve anyway to not block other audio
            };

            audio.addEventListener('canplaythrough', onLoad);
            audio.addEventListener('error', onError);

            // Trigger load if not already loading
            if (audio.readyState === 0) {
                audio.load();
            }
        });
    }

    // Enable audio after user interaction (required by browsers)
    public async enableAudio(): Promise<void> {
        try {
            await this.ensureAudioContext();

            // Test play a silent audio to unlock audio context
            if (this.ringtone) {
                const originalVolume = this.ringtone.volume;
                this.ringtone.volume = 0;
                await this.safePlay(this.ringtone);
                this.safeStop(this.ringtone);
                this.ringtone.volume = originalVolume;
            }
        } catch (error) {
            console.warn('Failed to enable audio:', error);
        }
    }

    // Cleanup method
    public destroy(): void {
        this.stopRingtone();
        this.stopDialTone();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.isInitialized = false;
    }
}

// Create a singleton instance
const audioManager = typeof window !== 'undefined' ? new AudioManager() : null;

export default audioManager;
