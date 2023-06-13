// Copyright (c) 2022 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

class RecordingProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    this.sampleRate = 16000;
    this.maxRecordingFrames = 999999;
    this.numberOfChannels = 1;

    this._recordingBuffer = new Float32Array(this.maxRecordingFrames);

    this.recordedFrames = 0;
    this.isRecording = false;

    // We will use a timer to gate our messages; this one will publish at 60hz
    this.framesSinceLastPublish = 0;
    this.publishInterval = this.sampleRate / 60;

    this.port.onmessage = (event) => {
      if (event.data.message === "START_RECORDING") {
        this.isRecording = true;
        this._recordingBuffer = new Float32Array(this.maxRecordingFrames);
        this.recordedFrames = 0;
        console.warn("processor: recording started");
      }
      if (event.data.message === "STOP_RECORDING") {
        this.isRecording = false;
        this.port.postMessage({
          message: "SEND_BUFFER",
          buffer: this._recordingBuffer,
          recordedFrames: this.recordedFrames,
        });
        console.warn("processor: recording stopped");
      }
    };
  }

  process(inputs, outputs, params) {
    const shouldPublish = this.framesSinceLastPublish >= this.publishInterval;

    // Validate that recording hasn't reached its limit.
    if (this.isRecording) {
      for (let input = 0; input < 1; input++) {
        for (let channel = 0; channel < this.numberOfChannels; channel++) {
          for (
            let sample = 0;
            sample < inputs[input][channel].length;
            sample++
          ) {
            const currentSample = inputs[input][channel][sample];
            // Copy data to recording buffer.
            if (this.isRecording && (sample + 1) % 3 === 0) {
              // this._recordingBuffer[sample + this.recordedFrames] = currentSample;
              this._recordingBuffer[this.recordedFrames] = currentSample;
              this.recordedFrames++;
            }
            // Pass data directly to output, unchanged.
            outputs[input][channel][sample] = currentSample;
          }
        }
      }
      // if (this.recordedFrames + 128 < this.maxRecordingFrames) {
      //   this.recordedFrames += 128;
      //   // Post a recording, recording length update on the clock's schedule
      //   if (shouldPublish) {
      //     this.port.postMessage({
      //       message: "UPDATE_RECORDING_LENGTH",
      //       recordingLength: this.recordedFrames,
      //     });
      //   }
      // } else {
      //   // Let the rest of the app know the limit was reached.
      //   this.isRecording = false;
      //   this.port.postMessage({
      //     message: "MAX_RECORDING_LENGTH_REACHED",
      //     buffer: this._recordingBuffer,
      //   });
      //   this.recordedFrames += 128;
      //   this.port.postMessage({
      //     message: "UPDATE_RECORDING_LENGTH",
      //     recordingLength: this.recordedFrames,
      //   });
      //   return false;
      // }
    }

    if (shouldPublish) {
      this.framesSinceLastPublish = 0;
    } else {
      this.framesSinceLastPublish += 128;
    }
    return true;
  }
}

registerProcessor("recording-processor", RecordingProcessor);
