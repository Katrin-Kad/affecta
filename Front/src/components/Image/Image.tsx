import styles from "./Image.module.css";

type ImageProps = {
    path: string;
}
const Image = ({path}: ImageProps) => {
    return (
      <img 
        src={path}
        className={styles.img}
      />
    );
  };
  
export default Image;