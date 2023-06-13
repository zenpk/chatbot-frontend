import CryptoJS from "crypto-js";
import React from "react";

const API_KEY = "";
const API_SECRET = "";
const APP_ID = "";
const ENCODING = "lame";

let iatWS: WebSocket;

function renderResult(
  resultData: string,
  setResult: React.Dispatch<React.SetStateAction<string>>
) {
  // 识别结束
  const jsonData = JSON.parse(resultData);
  if (jsonData.data && jsonData.data.result) {
    const data = jsonData.data.result;
    let str = "";
    const ws = data.ws;
    for (let i = 0; i < ws.length; i++) {
      str = str + ws[i].cw[0].w;
    }
    console.log(`data.ws: ${JSON.stringify(ws)}`);
    console.log(`Raw result: ${str}`);
    setResult((prev) => prev + str);
  }
  if (jsonData.code === 0 && jsonData.data.status === 2) {
    iatWS.close();
  }
  if (jsonData.code !== 0) {
    iatWS.close();
    console.error(jsonData);
  }
}

export function connectWebSocket(
  setDisplayText: React.Dispatch<React.SetStateAction<string>>,
  setResult: React.Dispatch<React.SetStateAction<string>>
) {
  const websocketUrl = getWebSocketUrl();
  console.log(websocketUrl);
  if ("WebSocket" in window) {
    iatWS = new WebSocket(websocketUrl);
  } else {
    alert("浏览器不支持 WebSocket");
    return;
  }
  setDisplayText("连接中");
  iatWS.onopen = (e) => {
    console.log("WebSocket opened");
    const params = {
      common: {
        app_id: APP_ID,
      },
      business: {
        language: "zh_cn",
        domain: "iat",
        accent: "mandarin",
        vad_eos: 5000,
        // dwa: "wpgs",
      },
      data: {
        status: 0,
        format: "audio/L16;rate=16000",
        encoding: ENCODING,
      },
    };
    iatWS.send(JSON.stringify(params));
    setDisplayText("正在录音");
  };
  iatWS.onmessage = (evt) => {
    renderResult(evt.data, setResult);
  };
  iatWS.onerror = (evt) => {
    console.log(`Error: ${evt}`);
    setDisplayText("按住录音");
  };
  iatWS.onclose = (evt) => {
    console.log(`Close: ${evt}`);
    setDisplayText("按住录音");
  };
}

export function closeWebSocket() {
  // iatWS.send(
  //   JSON.stringify({
  //     data: {
  //       status: 2,
  //       format: "audio/L16;rate=16000",
  //       encoding: ENCODING,
  //     },
  //   })
  // );
  iatWS.close();
}

export async function sendThroughWebSocket(content: string) {
  iatWS.send(
    JSON.stringify({
      data: {
        status: 2,
        format: "audio/L16;rate=16000",
        encoding: ENCODING,
        audio: content,
      },
    })
  );
}

function getWebSocketUrl() {
  // 请求地址根据语种不同变化
  let url = "wss://iat-api.xfyun.cn/v2/iat";
  const host = "iat-api.xfyun.cn";
  const apiKey = API_KEY;
  const apiSecret = API_SECRET;
  const date = new Date().toUTCString();
  const algorithm = "hmac-sha256";
  const headers = "host date request-line";
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = CryptoJS.HmacSHA256(signatureOrigin, apiSecret);
  const signature = CryptoJS.enc.Base64.stringify(signatureSha);
  const authorizationOrigin = `api_key="${apiKey}", algorithm="${algorithm}", headers="${headers}", signature="${signature}"`;
  const authorization = btoa(authorizationOrigin);
  url = `${url}?authorization=${authorization}&date=${date}&host=${host}`;
  return url;
}

export function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  return uint8ToBase64(bytes);
}

export function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function uint8ToInt16(uint8Array: Uint8Array) {
  const int16Array = new Int16Array(uint8Array.length / 2);
  // Iterate over the Uint8Array and combine two bytes into one 16-bit signed integer
  for (let i = 0, j = 0; i < uint8Array.length; i += 2, j++) {
    const byte1 = uint8Array[i];
    const byte2 = uint8Array[i + 1];
    // Combine the bytes into a 16-bit signed integer
    // Store the resulting value in the Int16Array
    int16Array[j] = (byte2 << 8) | byte1;
  }
  return int16Array;
}

export function float32ToInt16(arr: Float32Array) {
  let maxi = 0.0;
  const res = new Int16Array(arr.length);
  for (let i = 0; i < arr.length; i++) {
    if (Math.abs(arr[i]) > maxi) {
      maxi = arr[i];
    }
  }
  for (let i = 0; i < arr.length; i++) {
    res[i] = Math.floor((arr[i] / maxi) * 32767);
  }
  return res;
}

export function float32ToUint8(floatArray: Float32Array) {
  const uintArray = new Uint8Array(floatArray.length * 4); // Each float occupies 4 bytes
  const dataView = new DataView(uintArray.buffer);
  for (let i = 0; i < floatArray.length; i++) {
    dataView.setFloat32(i * 4, floatArray[i], true); // true for little-endian byte order
  }
  return uintArray;
}

export function int16toUint8(intArray: Int16Array) {
  const uintArray = new Uint8Array(intArray.length * 2);
  for (let i = 0; i < intArray.length; i++) {
    const value = intArray[i];
    uintArray[i * 2] = value & 0xff; // Low byte
    uintArray[i * 2 + 1] = (value >> 8) & 0xff; // High byte
  }
  return uintArray;
}

export function int8ToInt16Array(int8Array: Int8Array) {
  const int16Array = new Int16Array(int8Array.length / 2); // Create a new Int16Array with half the length

  for (let i = 0; i < int16Array.length; i++) {
    const lowerByte = int8Array[i * 2];
    const upperByte = int8Array[i * 2 + 1];

    // Combine the bytes to form a signed 16-bit value
    let value = (upperByte << 8) | (lowerByte & 0xff);

    // Handle negative values
    if (value & 0x8000) {
      value = value - 0x10000;
    }

    // Set the value in the Int16Array
    int16Array[i] = value;
  }

  return int16Array;
}
