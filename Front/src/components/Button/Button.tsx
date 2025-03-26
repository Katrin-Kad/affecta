import styles from "./Button.module.css";

type ButtonProps = {
    isBlue?: boolean;
    isSquare?: boolean;
    label: string;
  };

const Button: React.FC<ButtonProps> = ( {isBlue = false, isSquare = false, label}) => {
    return (
        <button className={`${styles.button} ${isBlue ? styles.blue : styles.white} ${isSquare ? styles.square : styles.circle}`}>
        {label}
        </button>
    );
  };
  
  export default Button;