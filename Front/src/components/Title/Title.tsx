import styles from "./Title.module.css";

type TitleProps = {
    label: string;
  };
const Logo: React.FC<TitleProps> = ({ label }) => {
    return (
      <p className={styles.text}>{label}</p>
    );
  };
  
  export default Logo;