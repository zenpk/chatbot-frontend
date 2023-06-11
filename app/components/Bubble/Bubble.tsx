import styles from "./Bubble.module.css";
import bot from "@/public/robot.png";
import user from "@/public/user.png";
import Image from "next/image";
import { Message } from "@/app/contexts/MessageContext";

export function Bubble(props: Message) {
  let className = styles.bubble;
  if (props.isUser) {
    className += ` ${styles.reverse}`;
  }
  return (
    <div className={className}>
      <Avatar isUser={props.isUser} />
      <Message msg={props.msg} />
    </div>
  );
}

function Message({ msg }: { msg: string }) {
  return <p className={styles.textBox}>{msg}</p>;
}

function Avatar({ isUser }: { isUser: boolean }) {
  const src = isUser ? user : bot;
  return <Image src={src} alt={"avatar"} width={64} height={64} />;
}
