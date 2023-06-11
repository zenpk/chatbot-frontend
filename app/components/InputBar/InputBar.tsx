import { Dispatch, SetStateAction, useState } from "react";
import styles from "./InputBar.module.css";
import { FaMicrophone } from "react-icons/fa";
import { BsFillChatLeftTextFill, BsSendFill } from "react-icons/bs";
import { RiVoiceprintFill } from "react-icons/ri";

export function InputBar() {
  const [isMicrophone, setIsMicrophone] = useState(true);

  return (
    <div className={styles.bar}>
      <Button isMicrophone={isMicrophone} setIsMicrophone={setIsMicrophone} />
      {isMicrophone ? <Input /> : <Record />}
      <Send />
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

function Send() {
  const [className, setClassName] = useState(styles.send);

  function handleDown() {
    setClassName(`${styles.send} ${styles.sendDark}`);
  }

  function handleUp() {
    setClassName(`${styles.send}`);
  }

  return (
    <button className={className} onMouseDown={handleDown} onMouseUp={handleUp}>
      <BsSendFill />
    </button>
  );
}

function Input() {
  return <input type={"text"} className={styles.input} />;
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
