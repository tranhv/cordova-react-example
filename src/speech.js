import conf from "./config";
import axios from 'axios';
/**
 * Holds the configurations of AudioContext engine
 * */
class AudioContextConfig {
  constructor(volume, loop = false, playbackRate = 1.0) {
    this.volume = volume;
    this.loop = loop;
    this.playbackRate = playbackRate;
  }
}

/**
 * Utilize Google Text-To-Speech API to generate spoken audio
 * */
export class GoogleTTS {
  constructor(lang, voice, speed, pitch, range) {
    this.lang = lang;
    this.voice = voice;
    this.speed = speed;
    this.pitch = pitch;
    this.range = range;

    // Play audio files using AudioContext
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    this.audioContext = null;
    this.createOrResumeAudioContext();
  }

  async start(text, delay, volume = 1.0, overrideConfig = {}) {
    return new Promise((resolve, reject) => {
      const { joy, anger, sadness, name, speed, pitch, range } = overrideConfig;
      this.createOrResumeAudioContext();

      // Generate necessary payload
      const payload = {
        "audioConfig": {
          "audioEncoding": "MP3",
          "speakingRate": this.speed,
          "pitch": this.pitch
        },
        "input": {
          "text": text
        },
        "voice": {
          "languageCode": this.lang === "pt-BR" ? "pt-PT" : this.lang,  // Replace pt-BR with pt-PT for MALE voice
          "ssmlGender": getVoiceGender(name || this.voice)
        }
      };

      // Send request to Google TTS API
      const ax = axios.create({
        baseURL: "https://texttospeech.googleapis.com/v1",
        method: "post",
        params: {
          "key": conf.googleTTSApi.key
        }
      });

      ax.post("/text:synthesize", payload).then((data) => {

        // Play the MP3 file that TTS returned
        const audioConfig = new AudioContextConfig(volume);
        speak(data.data.audioContent, delay, audioConfig);
      }).catch((e) => {
        console.error(e);
        reject(e);
      });

      /**
       * Play an ArrayBufferLike file with custom configuration
       * @param data: ArrayBuffer
       * @param delay: Seconds of delay if another audio context is playing
       * @param config: AudioContextConfig
       * @return null
       * */
      const speak = (data, delay, config) => {
        // Initialize the AudioContext
        this.createOrResumeAudioContext();

        // Convert base64 data to ArrayBuffer
        const audioData = this.base64ToArrayBuffer(data);

        // Config AudioContext engine
        this.audioContext.decodeAudioData(audioData, (audioBuffer) => {
          const source = this.audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.loop = config.loop;
          source.loopStart = 0;
          source.playbackRate.value = config.playbackRate;
          source.loopEnd = audioBuffer.duration;
          source.connect(this.audioContext.destination);
          source.start = source.start || source.noteOn;
          source.stop = source.stop || source.noteOff;

          // Delay audio when another track is playing
          source.onended = (e) => {
            source.onended = null;
            source.stop(0);
            setTimeout(() => {
              resolve();
            }, delay);
          };

          // Start playing audio
          source.start(0);
          setTimeout(() => {
            source.stop(0);
            resolve();
          }, 10000);

        }, (e) => {
          console.error(e);
          reject(e);
        });
      };
    });

  }

  /**
   * Convert base64-encoded mp3 to arrayBuffer
   * @param base64: base64-encoded file
   * @return ArrayBuffer
   * */
  base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Lazy initialization of AudioContext
   * */
  createOrResumeAudioContext() {
    if (!this.audioContext || this.audioContext.status === "close") {
      this.audioContext = new AudioContext();
    } else if (this.audioContext.state === "suspended") {
      this.audioContext.resume().then();
    }
  }



  async stop() {
    if (this.audioContext) {
      await this.audioContext.suspend();
    }
  }
}

const getVoiceGender = (voice) => {
  const MALE = "MALE";
  const FEMALE = "FEMALE";

  const voiceGenderDict = {
    "nozomi": FEMALE,
    "sumire": FEMALE,
    "maki": FEMALE,
    "kaho": FEMALE,
    "akari": FEMALE,
    "nanako": FEMALE,
    "reina": FEMALE,
    "seiji": MALE,
    "hiroshi": MALE,
    "osamu": MALE,
    "taichi": MALE,
    "koutarou": MALE,
    "anzu": MALE,
    "yuuto": FEMALE,
    "chihiro": FEMALE,
    "nozomi_emo": FEMALE,
    "maki_emo": FEMALE,
    "reina_emo": FEMALE,
    "taichi_emo": MALE,
  };

  return voiceGenderDict[voice] || "MALE";
};
