/**
 * Karmaraj Sound Engine
 * Hybrid High-Fidelity Audio + Procedural Web Audio Synthesizer
 * Provides crisp audio feedback for habits, dailies, todos, spells, and loot drops.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  private comboCount: number = 0;
  private lastComboTimestamp: number = 0;
  private ambientGain: GainNode | null = null;
  private ambientNodes: (AudioNode | number)[] = [];
  private currentAmbience: "hearth" | "dungeon" | null = null;
  private tactileProfile: "thock" | "wax" | "crystal" = "thock";
  private lastPlayedTimestamps: Map<string, number> = new Map();

  private isDebounced(key: string, ms: number = 75): boolean {
    const now = Date.now();
    const last = this.lastPlayedTimestamps.get(key) || 0;
    if (now - last < ms) return true;
    this.lastPlayedTimestamps.set(key, now);
    return false;
  }

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("karmaraj_sound_muted");
      this.isMuted = saved === "true";
      const savedProfile = localStorage.getItem("karmaraj_tactile_profile");
      if (savedProfile === "thock" || savedProfile === "wax" || savedProfile === "crystal") {
        this.tactileProfile = savedProfile;
      }
      this.preloadAudio();
    }
  }

  private preloadAudio() {
    if (typeof window === "undefined") return;
    const files = [
      "habit_plus",
      "habit_minus",
      "daily_complete",
      "todo_complete",
      "reward_buy",
      "level_up",
      "faint",
      "loot_drop",
      "achievement",
      "chat_ping",
    ];

    files.forEach((name) => {
      try {
        const audio = new Audio(`/audio/effects/${name}.mp3`);
        audio.preload = "auto";
        this.audioCache.set(name, audio);
      } catch {}
    });
  }

  private playFile(name: string, volume: number = 0.45): boolean {
    if (this.isMuted || typeof window === "undefined" || this.isDebounced(name, 70)) return false;
    try {
      let audio = this.audioCache.get(name);
      if (!audio) {
        audio = new Audio(`/audio/effects/${name}.mp3`);
        this.audioCache.set(name, audio);
      }
      const clone = audio.cloneNode() as HTMLAudioElement;
      clone.volume = Math.max(0, Math.min(1, volume));
      clone.play().catch(() => {});
      return true;
    } catch {
      return false;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== "undefined") {
      const win = window as unknown as {
        AudioContext?: typeof AudioContext;
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioCtx = win.AudioContext || win.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("karmaraj_sound_muted", String(this.isMuted));
    }
    if (this.isMuted) {
      this.stopAmbience();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getTactileProfile(): "thock" | "wax" | "crystal" {
    return this.tactileProfile;
  }

  public setTactileProfile(profile: "thock" | "wax" | "crystal") {
    this.tactileProfile = profile;
    if (typeof window !== "undefined") {
      localStorage.setItem("karmaraj_tactile_profile", profile);
    }
  }

  /**
   * Combo Pitch Escalation
   * Rapidly completing tasks within 8 seconds escalates chime along pentatonic scale
   * C4 -> D4 -> E4 -> G4 -> A4 -> C5
   */
  public playComboChime(forcedCombo?: number): number {
    if (this.isMuted) return 0;
    const now = Date.now();
    if (forcedCombo !== undefined) {
      this.comboCount = forcedCombo;
    } else {
      if (now - this.lastComboTimestamp > 8000) {
        this.comboCount = 1;
      } else {
        this.comboCount = Math.min(10, this.comboCount + 1);
      }
    }
    this.lastComboTimestamp = now;

    try {
      this.initContext();
      if (!this.ctx) return this.comboCount;

      const scale = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];
      const noteIdx = Math.min(scale.length - 1, this.comboCount - 1);
      const baseFreq = scale[noteIdx];
      const audioTime = this.ctx.currentTime;

      // Primary crystal chime
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(baseFreq, audioTime);

      gain1.gain.setValueAtTime(0.18, audioTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.45);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc1.start(audioTime);
      osc1.stop(audioTime + 0.45);

      // Higher harmonic shimmer
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFreq * 2, audioTime);

      gain2.gain.setValueAtTime(0.08, audioTime);
      gain2.gain.exponentialRampToValueAtTime(0.001, audioTime + 0.3);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(audioTime);
      osc2.stop(audioTime + 0.3);

      // Bonus triumphant flourish at 5+ combo
      if (this.comboCount >= 5) {
        [baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2].forEach((f, i) => {
          if (!this.ctx) return;
          const flourishOsc = this.ctx.createOscillator();
          const flourishGain = this.ctx.createGain();
          const t = audioTime + 0.08 + i * 0.05;

          flourishOsc.type = "sine";
          flourishOsc.frequency.setValueAtTime(f, t);

          flourishGain.gain.setValueAtTime(0.1, t);
          flourishGain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

          flourishOsc.connect(flourishGain);
          flourishGain.connect(this.ctx.destination);
          flourishOsc.start(t);
          flourishOsc.stop(t + 0.3);
        });
      }
    } catch {}

    return this.comboCount;
  }

  public getComboCount(): number {
    if (Date.now() - this.lastComboTimestamp > 8000) {
      this.comboCount = 0;
    }
    return this.comboCount;
  }

  /**
   * Procedural Ambient Soundscapes
   */
  public startTavernHearth() {
    if (this.isMuted || this.currentAmbience === "hearth") return;
    this.stopAmbience();

    try {
      this.initContext();
      if (!this.ctx) return;

      this.currentAmbience = "hearth";
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 1.5);
      masterGain.connect(this.ctx.destination);
      this.ambientGain = masterGain;

      // Low hearth drone
      const droneOsc1 = this.ctx.createOscillator();
      const droneOsc2 = this.ctx.createOscillator();
      droneOsc1.type = "triangle";
      droneOsc1.frequency.setValueAtTime(65.41, this.ctx.currentTime); // C2
      droneOsc2.type = "triangle";
      droneOsc2.frequency.setValueAtTime(67.2, this.ctx.currentTime); // slight detune

      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = "lowpass";
      droneFilter.frequency.setValueAtTime(140, this.ctx.currentTime);

      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      droneOsc1.connect(droneFilter);
      droneOsc2.connect(droneFilter);
      droneFilter.connect(droneGain);
      droneGain.connect(masterGain);

      droneOsc1.start();
      droneOsc2.start();

      this.ambientNodes.push(droneOsc1, droneOsc2, droneFilter, droneGain);

      // Crackling embers (procedural bursts)
      const crackleInterval = window.setInterval(() => {
        if (!this.ctx || !this.ambientGain || this.currentAmbience !== "hearth") return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.05;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(1200 + Math.random() * 1800, now);
        filter.Q.setValueAtTime(3 + Math.random() * 5, now);

        const popGain = this.ctx.createGain();
        popGain.gain.setValueAtTime(0.04 + Math.random() * 0.08, now);

        noise.connect(filter);
        filter.connect(popGain);
        popGain.connect(masterGain);

        noise.start(now);
      }, 400);

      this.ambientNodes.push(crackleInterval);
    } catch {}
  }

  public startDungeonAmbience() {
    if (this.isMuted || this.currentAmbience === "dungeon") return;
    this.stopAmbience();

    try {
      this.initContext();
      if (!this.ctx) return;

      this.currentAmbience = "dungeon";
      const masterGain = this.ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 2.0);
      masterGain.connect(this.ctx.destination);
      this.ambientGain = masterGain;

      // Subterranean hum
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(43.65, this.ctx.currentTime); // F1

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(90, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(masterGain);
      osc.start();

      this.ambientNodes.push(osc, filter);
    } catch {}
  }

  public stopAmbience() {
    if (!this.ctx || !this.ambientGain) {
      this.currentAmbience = null;
      return;
    }
    const currentGain = this.ambientGain;
    try {
      currentGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);
      setTimeout(() => {
        try {
          currentGain.disconnect();
          this.ambientNodes.forEach((node) => {
            if (typeof node === "number") {
              clearInterval(node);
            } else if ("stop" in node && typeof (node as AudioScheduledSourceNode).stop === "function") {
              (node as AudioScheduledSourceNode).stop();
              node.disconnect();
            } else if ("disconnect" in node) {
              node.disconnect();
            }
          });
          this.ambientNodes = [];
        } catch {}
      }, 1300);
    } catch {}
    this.ambientGain = null;
    this.currentAmbience = null;
  }

  public getAmbienceState(): "hearth" | "dungeon" | null {
    return this.currentAmbience;
  }

  /**
   * Tactile Mechanical Switch Profiles
   */
  public playTactileClick(profileOverride?: "thock" | "wax" | "crystal") {
    if (this.isMuted || this.isDebounced("tactile_click", 65)) return;
    const profile = profileOverride || this.tactileProfile;

    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (profile === "thock") {
        // Deep mechanical switch (linear bottom-out)
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.035);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.035);
      } else if (profile === "wax") {
        // Crisp wax parchment stamp
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.06);

        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else {
        // Crystal ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1480, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {}
  }

  /**
   * Universal sound dispatcher
   */
  public play(soundName: string) {
    if (this.isMuted) return;

    switch (soundName.toLowerCase()) {
      case "plus":
      case "habit_plus":
        this.playHabitPlus();
        break;
      case "minus":
      case "habit_minus":
        this.playHabitMinus();
        break;
      case "daily":
      case "daily_complete":
        this.playDailyComplete();
        break;
      case "todo":
      case "todo_complete":
        this.playTodoComplete();
        break;
      case "reward":
      case "reward_buy":
      case "purchase":
        this.playRewardBuy();
        break;
      case "levelup":
      case "level_up":
        this.playLevelUp();
        break;
      case "death":
      case "faint":
        this.playFaint();
        break;
      case "drop":
      case "loot":
      case "loot_drop":
        this.playLootDrop();
        break;
      case "achievement":
        this.playAchievement();
        break;
      case "spell":
      case "cast":
        this.playSpellCast();
        break;
      case "click":
        this.playTactileClick();
        break;
      case "coin":
      case "streak":
        this.playCoin();
        break;
      case "complete":
      case "stamp":
        this.playStamp();
        break;
      default:
        this.playTactileClick();
        break;
    }
  }

  public playHabitPlus() {
    if (this.isMuted) return;
    this.playComboChime();
    if (!this.playFile("habit_plus", 0.45)) {
      this.playCoin();
    }
  }

  public playHabitMinus() {
    if (this.isMuted) return;
    this.comboCount = 0;
    if (!this.playFile("habit_minus", 0.45)) {
      this.playError();
    }
  }

  public playDailyComplete() {
    if (this.isMuted) return;
    this.playComboChime();
    if (!this.playFile("daily_complete", 0.5)) {
      this.playStamp();
    }
  }

  public playTodoComplete() {
    if (this.isMuted) return;
    this.playComboChime();
    if (!this.playFile("todo_complete", 0.5)) {
      this.playStamp();
    }
  }

  public playRewardBuy() {
    if (this.isMuted) return;
    if (!this.playFile("reward_buy", 0.5)) {
      this.playPurchase();
    }
  }

  public playLevelUp() {
    if (this.isMuted) return;
    if (!this.playFile("level_up", 0.6)) {
      this.playLevelUpSynth();
    }
  }

  public playFaint() {
    if (this.isMuted) return;
    this.comboCount = 0;
    if (!this.playFile("faint", 0.55)) {
      this.playError();
    }
  }

  public playLootDrop() {
    if (this.isMuted) return;
    if (!this.playFile("loot_drop", 0.55)) {
      this.playCoin();
    }
  }

  public playAchievement() {
    if (this.isMuted) return;
    if (!this.playFile("achievement", 0.6)) {
      this.playLevelUpSynth();
    }
  }

  public playSpellCast() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.25);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playClick() {
    this.playTactileClick();
  }

  public playCoin() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.08);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  public playStamp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.18);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {}
  }

  private playLevelUpSynth() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const start = this.ctx.currentTime + idx * 0.08;
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {}
  }

  public playPurchase() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + i * 0.05;

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {}
  }

  public playError() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.15);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {}
  }
}

export const soundFx = new SoundEngine();
