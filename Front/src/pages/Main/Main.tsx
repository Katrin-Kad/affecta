import Articles from "../../components/Articles/Articles";
import Button from "../../components/Button/Button";
import HelloMessage from "../../components/HelloMessage/HelloMessage";
import TasksAndTests from "../../components/Tasks/TasksAndTests";
import Title from "../../components/Title/Title";
import Text from "../../components/Text/Text";
import Image from "../../components/Image/Image";
import styles from "./Main.module.css";

const Main = () => {
  return (
    <div className={styles.main}>
      <div className={styles.container}>
        <HelloMessage />
      </div>
      <Title label={'А вот наши свежие мысли'}/>
      <div className={styles.container}>
        <Articles limit={6}/>
        <div className={styles.btn}>
          <Button isBlue={true} isSquare={true} label={'Показать ещё...'}/>
        </div>
      </div>
      <Title label={'Здесь ты можешь позаботиться о себе'}/>
      <div className={styles.container}>
        <TasksAndTests limit={6}/>
        <div className={styles.btn}>
          <Button isBlue={true} isSquare={true} label={'Показать ещё...'}/>
        </div>
      </div>
      <Title label={'Чтобы познакомиться с собой поближе, воспользуйся дневником эмоций'}/>
      <div className={styles.container__last}>
        <Image path='/Emotions.png'/>
        <div className={styles.box}>
          <Text text='Дневник эмоций — это простой способ понять себя лучше. Записывай свои чувства, отслеживай изменения и находи гармонию каждый день. Сделай первый шаг сегодня — путь к внутреннему спокойствию ближе, чем кажется!'/>
          <Button isBlue={true} isSquare={true} label={'Попробовать'}/>
        </div>
      </div>
    </div>
  );
};

export default Main;
