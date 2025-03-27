import styles from "./Card.module.css";
import { Article } from '../../api/articlesApi';
import { Test } from '../../api/testsApi';

interface CardProps {
    data: Article | Test;
  }

const Card = ({data}: CardProps) => {
    return (
        <div key={data._id} className={styles.container}>
            <div className={styles.card}>
                <img
                    // eslint-disable-next-line no-constant-binary-expression
                    src={`http://localhost:8080${data.image}` || "https://kartinki.pics/uploads/posts/2021-01/1610897468_28-p-bledno-goluboi-odnotonnii-fon-32.jpg"}
                    alt={data.title}
                    className={styles.image}
                />
                <div className={styles.tags}>
                    {data.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
            <p className={styles.title}>{data.title}</p>
            <p className={styles.text}>{data.shortDescription}</p>
        </div>
    );
  };
  
  export default Card;