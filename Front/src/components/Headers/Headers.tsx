import Button from "../Button/Button";
import Logo from "../Logo/Logo";
import Menu from "../Menu/Menu";
import styles from "./Headers.module.css";

const Header = () => {
  const menuItems = ['Дневник эмоций', 'Блог', 'Тесты и задания']

  return (
    <div className={styles.container}>
      <Logo />
      <Menu items={menuItems} />
      <div className={styles.container_buttons}>
        <Button label={'Вход'}/>
        <Button label={'Регистрация'} isBlue={true}/>
      </div>
    </div>
  );
};

export default Header;
