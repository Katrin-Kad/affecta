import styles from "./Text.module.css";

type TextProps = {
    text: string,
}
const Text = ({ text }: TextProps) => {
    return (
      <p className={styles.text}>{text}</p>
    );
  };
  
export default Text;