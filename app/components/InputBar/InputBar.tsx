import React, {
  Dispatch,
  RefObject,
  SetStateAction,
  useContext,
  useRef,
  useState,
} from "react";
import styles from "./InputBar.module.css";
import { FaMicrophone } from "react-icons/fa";
import { BsFillChatLeftTextFill, BsSendFill } from "react-icons/bs";
import { RiVoiceprintFill } from "react-icons/ri";
import { InputContext } from "@/app/contexts/InputContext";
import { MessageContext } from "@/app/contexts/MessageContext";
import { fetchWrapper } from "@/app/utils/fetch";

export function InputBar() {
  const [isMicrophone, setIsMicrophone] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  const [text, textDispatch] = useContext(InputContext)!;
  const [, msgDispatch] = useContext(MessageContext)!;

  // TODO
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
        <Record />
      )}
      {isMicrophone && <Send inputRef={inputRef} handleSend={handleSend} />}
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

function Send({
  inputRef,
  handleSend,
}: {
  inputRef: RefObject<HTMLInputElement> | null;
  handleSend: () => void;
}) {
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

function Record() {
  const [className, setClassName] = useState(styles.record);

  function handleDown() {
    setClassName(`${styles.record} ${styles.recordBlack}`);
  }

  function handleUp() {
    setClassName(`${styles.record}`);
  }

  return (
    <button className={className} onMouseDown={handleDown} onMouseUp={handleUp}>
      <RiVoiceprintFill />
      &nbsp;&nbsp;Hold to Talk
    </button>
  );
}
