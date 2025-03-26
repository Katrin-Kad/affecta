import Articles from "../../components/Articles/Articles";
import HelloMessage from "../../components/HelloMessage/HelloMessage";
import Title from "../../components/Title/Title";
import styles from "./Main.module.css";

const Main = () => {
  return (
    <div>
      <div className={styles.container}>
        <HelloMessage />
      </div>
      <Title label={'А вот наши свежие мысли'}/>
      <Articles limit={6}/>
    </div>
  );
};

export default Main;
