import { NIGHT_MUSIC } from "./config";

type PlaybackState = "paused" | "loading" | "playing" | "error";

export function createNightMusic(onState: (state: PlaybackState) => void) {
  const lifetime = new AbortController();
  let context: AudioContext | undefined;
  let gain: GainNode | undefined;
  let decoded: Promise<AudioBuffer> | undefined;
  let source: AudioBufferSourceNode | undefined;
  let startedAt = 0;
  let offset = 0;
  let volume: number = NIGHT_MUSIC.initialVolume;
  let muted = false;
  let state: PlaybackState = "paused";
  let request = 0;
  let resumeAfterHidden = false;
  let wasHidden = document.hidden;

  const level = () => (muted ? 0 : volume);

  function setState(next: PlaybackState) {
    state = next;
    onState(next);
  }

  function stop() {
    request++;
    if (source && context) {
      offset =
        (offset + context.currentTime - startedAt) % source.buffer!.duration;
      source.stop();
      source.disconnect();
      source = undefined;
    }
    setState("paused");
  }

  async function load(audio: AudioContext) {
    const url = new URL(
      import.meta.env.BASE_URL + NIGHT_MUSIC.source,
      document.baseURI,
    );
    const response = await fetch(url, { signal: lifetime.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return audio.decodeAudioData(await response.arrayBuffer());
  }

  async function start() {
    const id = ++request;
    setState("loading");
    try {
      if (!context) {
        context = new AudioContext();
        gain = context.createGain();
        gain.connect(context.destination);
        context.addEventListener(
          "statechange",
          () => {
            if (
              state === "playing" &&
              context?.state !== "running" &&
              !document.hidden
            )
              stop();
          },
          { signal: lifetime.signal },
        );
      }
      // Request resume inside the click task before any network/decode work.
      await resumeOutput(context);
      if (id !== request || lifetime.signal.aborted) return;

      decoded ??= load(context).catch((error: unknown) => {
        decoded = undefined;
        throw error;
      });
      const buffer = await decoded;
      if (id !== request || lifetime.signal.aborted) return;
      if (context.state !== "running" || !gain)
        throw new Error("Audio output is suspended");

      const node = context.createBufferSource();
      node.buffer = buffer;
      node.loop = true;
      node.connect(gain);
      startedAt = context.currentTime;
      gain.gain.cancelScheduledValues(startedAt);
      gain.gain.setValueAtTime(0, startedAt);
      gain.gain.linearRampToValueAtTime(
        level(),
        startedAt + NIGHT_MUSIC.fadeSeconds,
      );
      node.start(startedAt, offset);
      source = node;
      setState("playing");
    } catch {
      if (id === request && !lifetime.signal.aborted) setState("error");
    }
  }

  function applyLevel() {
    if (!context || !gain || !source) return;
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setTargetAtTime(level(), now, 0.03);
  }

  document.addEventListener(
    "visibilitychange",
    () => {
      if (document.hidden === wasHidden) return;
      wasHidden = document.hidden;
      if (wasHidden) {
        resumeAfterHidden =
          (state === "playing" || state === "loading") && level() > 0;
        if (state === "playing" || state === "loading") stop();
      } else if (resumeAfterHidden) {
        resumeAfterHidden = false;
        void start();
      }
    },
    { signal: lifetime.signal },
  );

  return {
    togglePlayback() {
      resumeAfterHidden = false;
      if (state === "loading" || state === "playing") stop();
      else void start();
    },
    setVolume(value: number) {
      volume = value;
      if (level() === 0) resumeAfterHidden = false;
      applyLevel();
    },
    setMuted(value: boolean) {
      muted = value;
      if (muted) resumeAfterHidden = false;
      applyLevel();
    },
    dispose() {
      lifetime.abort();
      stop();
      gain?.disconnect();
      if (context && context.state !== "closed") {
        void context.close().catch(() => {});
      }
    },
  };
}

async function resumeOutput(context: AudioContext) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      context.resume(),
      new Promise<never>((_, reject) => {
        // Some browsers defer a policy-blocked resume instead of rejecting it.
        timeout = setTimeout(
          () => reject(new Error("Audio output did not resume")),
          2000,
        );
      }),
    ]);
  } finally {
    clearTimeout(timeout);
  }
}
