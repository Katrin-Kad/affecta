import Menu from "../Menu/Menu";
import styles from "./Footer.module.css";

const Footer = () => {
  const menuItems = ['©2025 Affecta', 'О нас', 'Контакты']

  return (
    <div className={styles.container}>
      <Menu items={menuItems} />
      <div className={styles.container_icons}>
        
      </div>
    </div>
  );
};

export default Footer;
