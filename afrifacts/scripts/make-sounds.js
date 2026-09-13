/**
 * Generates the two quiz answer sounds into assets/sounds/.
 *
 *   node scripts/make-sounds.js
 *
 * They are synthesised rather than sourced so nothing shipped in the APK
 * carries a licence or a credit to lose. The first pass at this was two
 * bare sine tones, which is the sound of a hearing test: a sine has one
 * partial, so there is nothing in it for the ear to recognise as an
 * instrument and it reads as equipment rather than as the app.
 *
 * What makes a short UI sound feel like an object is the overtones and the
 * shape of the decay, not the note. Both sounds here are built the same
 * way, as a stack of partials over one fundamental with the upper partials
 * dying faster than the lower ones, which is what every struck thing in
 * the world does and what a held sine never does. One partial is
 * deliberately off the harmonic series, and that is the whole difference
 * between a tone and a bell.
 *
 * CORRECT is an A major triad, arpeggiated so fast that the three notes
 * are still ringing together by the third. It rises, it resolves, and it
 * is over in under half a second.
 *
 * WRONG is a falling minor third, rounded rather than struck, with a sub
 * octave under it for warmth and a slight downward bend on the last note.
 * Section 10 forbids the quiz shaming a low score, so this had to stay a
 * soft landing. A buzzer is exactly what it must not be, and so is
 * anything with a sharp attack.
 */

const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;
const OUT_DIR = path.join(__dirname, '..', 'assets', 'sounds');

/**
 * One struck note.
 *
 * `partials` are [multiple of the fundamental, amplitude] pairs. Anything
 * other than a whole-number multiple is inharmonic and is what gives the
 * strike its metal. Upper partials are given a shorter tau than the
 * fundamental, so the sound brightens at the attack and mellows as it
 * falls away.
 *
 * @param {Float64Array} buffer      written into, in place
 * @param {number}       onset       seconds from the start of the buffer
 * @param {number}       freq        fundamental, Hz
 * @param {object}       opts
 * @param {number}       opts.length seconds the note is allowed to ring
 * @param {number}       opts.attack seconds to full amplitude
 * @param {number}       opts.tau    exponential decay constant, seconds
 * @param {[number, number][]} opts.partials
 * @param {number}      [opts.bend]  fraction to fall by over the note
 */
function strike(buffer, onset, freq, { length, attack, tau, partials, bend = 0 }) {
  const start = Math.round(onset * SAMPLE_RATE);
  const count = Math.round(length * SAMPLE_RATE);

  // Phase is accumulated rather than computed from t, because a bend
  // changes the frequency as the note runs and sin(2*pi*f(t)*t) would
  // step the phase every sample and click.
  const phase = partials.map(() => 0);

  for (let i = 0; i < count; i += 1) {
    const index = start + i;
    if (index >= buffer.length) break;

    const t = i / SAMPLE_RATE;
    const envelope =
      (t < attack ? t / attack : 1) * Math.exp(-(t - Math.min(t, attack)) / tau);
    const f = freq * (1 - bend * (t / length));

    let sample = 0;
    for (let p = 0; p < partials.length; p += 1) {
      const [multiple, amplitude] = partials[p];
      phase[p] += (2 * Math.PI * f * multiple) / SAMPLE_RATE;
      // Brighter partials fade first. 1 stays, the top of the stack is
      // roughly twice as quick.
      const shed = Math.exp(-t / (tau / (1 + 0.5 * (multiple - 1))));
      sample += Math.sin(phase[p]) * amplitude * shed;
    }

    buffer[index] += sample * envelope;
  }
}

/** Scale to a target peak, then fade the last few ms so the file cannot click. */
function finish(buffer, peak) {
  let max = 0;
  for (const sample of buffer) max = Math.max(max, Math.abs(sample));
  const gain = max === 0 ? 0 : peak / max;

  const fade = Math.round(0.006 * SAMPLE_RATE);
  for (let i = 0; i < buffer.length; i += 1) {
    const tail = i > buffer.length - fade ? (buffer.length - i) / fade : 1;
    buffer[i] *= gain * tail;
  }
  return buffer;
}

/** 16-bit mono PCM. */
function wav(buffer) {
  const data = Buffer.alloc(buffer.length * 2);
  for (let i = 0; i < buffer.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, buffer[i]));
    data.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // PCM chunk size
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(1, 22); // mono
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28); // byte rate
  header.writeUInt16LE(2, 32); // block align
  header.writeUInt16LE(16, 34); // bits
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);

  return Buffer.concat([header, data]);
}

function silence(seconds) {
  return new Float64Array(Math.round(seconds * SAMPLE_RATE));
}

/**
 * Right: A5, C#6, E6, struck 50ms apart and left to ring into each other.
 *
 * The arpeggio matters more than the chord. Three notes at once is a
 * fanfare and feels like a level-up screen; three notes chased up inside
 * a tenth of a second is a flick, and it lands before the reader has
 * finished registering the green.
 */
function correct() {
  const buffer = silence(0.5);
  const mallet = {
    length: 0.4,
    attack: 0.003,
    tau: 0.14,
    // 4.17 is the inharmonic one. Struck metal has a partial near there
    // and the harmonic series does not, so it is what stops this sounding
    // like an organ.
    partials: [
      [1, 0.5],
      [2, 0.2],
      [3, 0.08],
      [4.17, 0.05],
    ],
  };

  strike(buffer, 0.0, 880.0, mallet); // A5
  strike(buffer, 0.05, 1108.73, mallet); // C#6
  strike(buffer, 0.1, 1318.51, { ...mallet, length: 0.38, tau: 0.17 }); // E6

  return finish(buffer, 0.62);
}

/**
 * Wrong: G4 falling to Eb4, with a sub octave under both.
 *
 * A minor third down is the shape of "ah well" and is about as far from a
 * klaxon as a two-note figure gets. The attack is slow enough that
 * nothing is struck, the sub octave keeps it warm rather than thin, and
 * the second note sags a little over its tail so it settles instead of
 * stopping. Quieter than the right answer on purpose: being wrong should
 * not be the louder event.
 */
function wrong() {
  const buffer = silence(0.52);
  const soft = {
    length: 0.34,
    attack: 0.016,
    tau: 0.15,
    partials: [
      [0.5, 0.2], // sub octave, body
      [1, 0.5],
      [2, 0.11],
      [3, 0.03],
    ],
  };

  strike(buffer, 0.0, 392.0, soft); // G4
  strike(buffer, 0.13, 311.13, { ...soft, length: 0.38, tau: 0.17, bend: 0.02 }); // Eb4

  return finish(buffer, 0.48);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [name, make] of [
  ['correct', correct],
  ['wrong', wrong],
]) {
  const file = path.join(OUT_DIR, `${name}.wav`);
  const bytes = wav(make());
  fs.writeFileSync(file, bytes);
  console.log(`${name}.wav  ${bytes.length} bytes`);
}
