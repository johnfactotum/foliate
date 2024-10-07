import Gio from 'gi://Gio'
import Spiel from 'gi://Spiel'

Gio._promisify(Spiel.Speaker, 'new')

export class SpielClient {
    #speaker
    #pitch = 1.0
    #rate = 1.0
    #promises = new Map()
    async init() {
        if (!this.#speaker) {
          this.#speaker = await Spiel.Speaker.new(null);
        }
    }

    speak(str) {
        const text = str.replace('\r\n.', '\r\n..') + '\r\n.'
        console.log(`speak: "${text}"`);
        const rate = this.#rate;
        const pitch = this.#pitch;
        const utterance = new Spiel.Utterance({text, rate, pitch, is_ssml: true});
        let speaker = this.#speaker;
        return new Promise((resolve, reject) => {
          speaker.connect('utterance-finished', (_, utt) => { if (utt == utterance) resolve(); });
          speaker.connect('utterance-canceled', (_, utt) => { if (utt == utterance) resolve(); });
          speaker.connect('utterance-error', (_, utt, err) => { if (utt == utterance) reject(err); });
          speaker.speak(utterance);
        });
    }
    pause() {
        this.#speaker.pause();
        return this.send('PAUSE self')
    }
    resume() {
        this.#speaker.resume();
    }
    stop() {
        this.#speaker.cancel();
    }
    setRate(rate) {
        this.#rate = rate;
    }
    setPitch(pitch) {
        this.#pitch = pitch;
    }
}
