const fs = require('fs');
const path = require('path');

// Usage: node generate-sounds.js [outputDir]
const outputDir = process.argv[2] || path.join(__dirname, '..', 'public', 'sounds');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Simple WAV header generator
function createWavHeader(dataLength, sampleRate = 44100) {
    const buffer = Buffer.alloc(44);
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataLength, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (1 = PCM)
    buffer.writeUInt16LE(1, 22); // NumChannels (Mono)
    buffer.writeUInt32LE(sampleRate, 24); // SampleRate
    buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
    buffer.writeUInt16LE(2, 32); // BlockAlign (NumChannels * BitsPerSample/8)
    buffer.writeUInt16LE(16, 34); // BitsPerSample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataLength, 40);
    return buffer;
}

// Generate a tone
function generateTone(freq, durationMs, type = 'sine', volume = 0.5) {
    const sampleRate = 44100;
    const numSamples = Math.floor((durationMs / 1000) * sampleRate);
    const buffer = Buffer.alloc(numSamples * 2);

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        let value = 0;

        // Simple Envelope (Attack/Decay) to avoid clicking
        let envelope = 1;
        if (i < 1000) envelope = i / 1000;
        if (i > numSamples - 1000) envelope = (numSamples - i) / 1000;

        if (type === 'sine') {
            value = Math.sin(2 * Math.PI * freq * t);
        } else if (type === 'square') {
            value = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1;
        } else if (type === 'sawtooth') {
            value = 2 * (t * freq - Math.floor(t * freq + 0.5));
        } else if (type === 'noise') {
            value = Math.random() * 2 - 1;
        }

        const pcm = Math.max(-32768, Math.min(32767, value * volume * envelope * 32767));
        buffer.writeInt16LE(pcm, i * 2);
    }
    return buffer;
}

// Generate specific sounds
const sounds = {
    'click.wav': generateTone(800, 50, 'sine', 0.2), // Short high blip
    'correct.wav': Buffer.concat([
        generateTone(523.25, 100, 'sine', 0.4), // C5
        generateTone(659.25, 200, 'sine', 0.4)  // E5
    ]),
    'wrong.wav': Buffer.concat([
        generateTone(200, 150, 'sawtooth', 0.3),
        generateTone(150, 250, 'sawtooth', 0.3)
    ]),
    'complete.wav': Buffer.concat([
        generateTone(523.25, 100, 'sine', 0.4), // C5
        generateTone(659.25, 100, 'sine', 0.4), // E5
        generateTone(783.99, 100, 'sine', 0.4), // G5
        generateTone(1046.50, 400, 'sine', 0.4) // C6
    ]),
    'levelup.wav': Buffer.concat([
        generateTone(440, 100, 'square', 0.2),
        generateTone(880, 400, 'square', 0.2)
    ]),
    'unlock.wav': Buffer.concat([
        generateTone(600, 100, 'sine', 0.3),
        generateTone(800, 100, 'sine', 0.3),
        generateTone(1200, 200, 'sine', 0.3)
    ])
};

Object.entries(sounds).forEach(([filename, data]) => {
    const header = createWavHeader(data.length);
    const fileBuffer = Buffer.concat([header, data]);
    fs.writeFileSync(path.join(outputDir, filename), fileBuffer);
    console.log(`Generated ${filename}`);
});
