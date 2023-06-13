import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./InputBar.module.css";
import { FaMicrophone } from "react-icons/fa";
import { BsFillChatLeftTextFill, BsSendFill } from "react-icons/bs";
import { RiVoiceprintFill } from "react-icons/ri";
import { InputContext } from "@/app/contexts/InputContext";
import { MessageActions, MessageContext } from "@/app/contexts/MessageContext";
import { fetchWrapper } from "@/app/utils/fetch";
import {
  closeWebSocket,
  connectWebSocket,
  float32ToInt16,
  sendThroughWebSocket,
  uint8ToBase64,
} from "@/app/components/InputBar/iat";
import {
  getRecorder,
  startRecording,
  stopRecording,
} from "@/app/hooks/useRecorder";
import lamejs from "lamejstmp";

export function InputBar() {
  const [isMicrophone, setIsMicrophone] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const [text, textDispatch] = useContext(InputContext)!;
  const [, msgDispatch] = useContext(MessageContext)!;

  async function handleSend() {
    if (text.length <= 0) return;
    msgDispatch({ type: "addUser", msg: text });
    try {
      const sendText = text;
      textDispatch({ type: "edit", text: "" });
      const resp = await fetchWrapper.post("/chat", { text: sendText });
      console.log(resp);
      msgDispatch({ type: "addBot", msg: resp.text });
    } catch (e) {
      console.log(e);
    }
  }

  return (
    <div className={styles.bar}>
      <Button isMicrophone={isMicrophone} setIsMicrophone={setIsMicrophone} />
      {isMicrophone ? (
        <Input inputRef={inputRef} handleSend={handleSend} />
      ) : (
        <Record isMicrophone={isMicrophone} dispatch={msgDispatch} />
      )}
      {isMicrophone && <Send handleSend={handleSend} />}
    </div>
  );
}

function Button({
  isMicrophone,
  setIsMicrophone,
}: {
  isMicrophone: boolean;
  setIsMicrophone: Dispatch<SetStateAction<boolean>>;
}) {
  function handleClick() {
    setIsMicrophone((prev) => {
      return !prev;
    });
  }

  return (
    <button onClick={handleClick} className={styles.button}>
      {isMicrophone ? <FaMicrophone /> : <BsFillChatLeftTextFill />}
    </button>
  );
}

function Send({ handleSend }: { handleSend: () => void }) {
  const [className, setClassName] = useState(styles.send);

  function handleDown() {
    setClassName(`${styles.send} ${styles.sendDark}`);
  }

  function handleUp() {
    setClassName(`${styles.send}`);
  }

  return (
    <button
      className={className}
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onClick={handleSend}
    >
      <BsSendFill />
    </button>
  );
}

function Input({
  inputRef,
  handleSend,
}: {
  inputRef: RefObject<HTMLInputElement> | null;
  handleSend: () => void;
}) {
  const [text, dispatch] = useContext(InputContext)!;

  function handleKeyDown(evt: React.KeyboardEvent) {
    if (evt.key === "Enter") {
      handleSend();
    }
  }

  function handleChange() {
    dispatch({ type: "edit", text: inputRef!.current!.value });
  }

  return (
    <input
      type={"text"}
      className={styles.input}
      value={text}
      ref={inputRef}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

function Record({
  isMicrophone,
  dispatch,
}: {
  isMicrophone: boolean;
  dispatch: React.Dispatch<MessageActions>;
}) {
  const [className, setClassName] = useState(styles.record);

  const [displayText, setDisplayText] = useState("按住录音");
  const [result, setResult] = useState("");

  const [buffer, setBuffer] = useState<Float32Array | null>(null);

  const [recordingNode, setRecordingNode] = useState<AudioWorkletNode | null>(
    null
  );

  useEffect(() => {
    getRecorder(setBuffer, setRecordingNode);
    console.log("recording node ok");
  }, []);

  // handle result update
  useEffect(() => {
    console.log(`Result: ${result}`);
    if (result !== "") {
      dispatch({ type: "edit", msg: result });
      closeWebSocket();
    }
  }, [dispatch, result]);

  function handleDown() {
    setClassName(`${styles.record} ${styles.recordBlack}`);
    dispatch({ type: "addUser", msg: "..." });
    connectWebSocket(setDisplayText, setResult);
    startRecording(recordingNode);
    // mediaRecorder!.addEventListener("dataavailable", async (evt) => {
    //   if (typeof evt.data === "undefined") return;
    //   if (evt.data.size === 0) return;
    //   const arrayBuffer = await evt.data.arrayBuffer();
    //   // const rawBase64 = arrayBufferToBase64(arrayBuffer);
    //   // console.log(rawBase64);
    //   // https://stackoverflow.com/questions/37394541/how-to-convert-blob-to-int16array
    // });
  }

  async function handleUp() {
    setClassName(`${styles.record}`);
    stopRecording(recordingNode);
  }

  useEffect(() => {
    if (buffer) {
      console.log(`Got Buffer!! ${buffer.length}`);
      const int16Array = float32ToInt16(buffer);
      // mp3
      const mp3Encoder = new lamejs.Mp3Encoder(1, 16000, 320);
      const mp3Data = mp3Encoder.encodeBuffer(int16Array);
      const finalMp3Data = mp3Encoder.flush();
      const mergedMp3Data = new Uint8Array(
        mp3Data.length + finalMp3Data.length
      );
      mergedMp3Data.set(mp3Data, 0);
      mergedMp3Data.set(finalMp3Data, mp3Data.length);
      const mp3DataForBlob = [];
      mp3DataForBlob.push(new Int8Array(mp3Data));
      mp3DataForBlob.push(new Int8Array(finalMp3Data));
      // playback
      // const mp3Blob = new Blob(mp3DataForBlob, { type: "audio/mpeg" });
      // mp3Blob.arrayBuffer().then((ab) => {
      //   const bUrl = window.URL.createObjectURL(mp3Blob);
      //   const temp = document.createElement("audio");
      //   temp.src = bUrl;
      //   temp.play();
      // });
      const mp3Base64 = uint8ToBase64(mergedMp3Data);
      sendThroughWebSocket(mp3Base64);
      // const blob = new Blob([buffer.buffer], { type: "audio/wav" });
      // blob.arrayBuffer().then((ab) => {
      //   const uint8Array = new Uint8Array(ab);
      //   const base64 = uint8ToBase64(uint8Array);
      //   console.log(base64);
      // });
      // const uint8Array = int16toUint8(int16Array);
      // const base64 = uint8ToBase64(uint8Array);
      // console.log(base64);
      // sendThroughWebSocket(base64);
    }
  }, [buffer]);

  return (
    <button className={className} onMouseDown={handleDown} onMouseUp={handleUp}>
      <RiVoiceprintFill />
      &nbsp;&nbsp;{displayText}
    </button>
  );
}
