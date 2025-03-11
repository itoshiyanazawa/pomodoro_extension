class BrownNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOut = 0.0;
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    for (let channel = 0; channel < output.length; channel++) {
      const outputChannel = output[channel];
      for (let i = 0; i < outputChannel.length; i++) {
        let white = Math.random() * 2 - 1;
        this.lastOut = (this.lastOut + (0.02 * white)) / 1.02;
        outputChannel[i] = this.lastOut * 3.5; // (roughly) compensate for gain
      }
    }
    return true;
  }
}

registerProcessor('brown-noise-processor', BrownNoiseProcessor);