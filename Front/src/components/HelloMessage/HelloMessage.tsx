import styles from "./HelloMessage.module.css";
const HelloMessage = () => {
    return (
        <div className={styles.container}>
            <h1 className={[styles.text, styles.text__highlight].join(" ")}>Привет!</h1>
            <p className={[styles.text, styles.text__default].join(" ")}>Это affecta — твой путеводитель в мир эмоций.</p>
        </div>
    );
  };
  
  export default HelloMessage;