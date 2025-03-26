import styles from "./Card.module.css";
import { Article } from '../../api/articlesApi';

interface CardProps {
    article: Article;
  }

const Card = ({article}: CardProps) => {
    return (
        <div key={article._id} className={styles.container}>
            <div className={styles.card}>
                <img
                    // eslint-disable-next-line no-constant-binary-expression
                    src={`http://localhost:8080${article.image}` || "https://kartinki.pics/uploads/posts/2021-01/1610897468_28-p-bledno-goluboi-odnotonnii-fon-32.jpg"}
                    alt={article.title}
                    className={styles.image}
                />
                <div className={styles.tags}>
                    {article.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                </div>
            </div>
            <p className={styles.title}>{article.title}</p>
            <p className={styles.text}>{article.shortDescription}</p>
        </div>
    );
  };
  
  export default Card;