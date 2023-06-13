export function getRecorder(
  setBuffer: (buffer: Float32Array) => void,
  setRecordingNode: (node: AudioWorkletNode) => void
) {
  let recordingNode: AudioWorkletNode;
  navigator.mediaDevices
    .getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        sampleSize: 16,
        echoCancellation: false,
        autoGainControl: true,
        noiseSuppression: true,
      },
      video: false,
    })
    .then((micStream) => {
      const context = new AudioContext();
      const micSourceNode = context.createMediaStreamSource(micStream);
      context.audioWorklet
        .addModule("worklets/recording-processor.js")
        .then(() => {
          recordingNode = new AudioWorkletNode(context, "recording-processor");
          recordingNode.port.onmessage = (event: MessageEvent) => {
            if (event.data.message === "SEND_BUFFER") {
              const temp = event.data.buffer.slice(
                0,
                event.data.recordedFrames
              );
              setBuffer(temp);
            }
          };
          micSourceNode.connect(recordingNode).connect(context.destination);
          setRecordingNode(recordingNode);
          console.log("recorder initialized");
        });
    });
}

export function startRecording(recordingNode: AudioWorkletNode | null) {
  recordingNode?.port.postMessage({
    message: "START_RECORDING",
  });
}

export function stopRecording(recordingNode: AudioWorkletNode | null) {
  recordingNode?.port.postMessage({
    message: "STOP_RECORDING",
  });
}
