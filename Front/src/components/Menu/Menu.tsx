import styles from "./Menu.module.css";

type ListProps = {
    items: string[];
  };
const Menu: React.FC<ListProps> = ({ items }) => {
    return (
        <div className={styles.container}>
            {items.map((item, index) => (
                <p className={styles.text} key={index}>{item}</p>
            ))}
        </div>
    );
  };
  
  export default Menu;