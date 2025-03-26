import styles from "./Articles.module.css";
import { useGetArticles } from '../../hooks/useGetArticles';
import Card from '../Card/Card';

type ArticlesProps = {
    page?: number;
    limit?: number;
}

const Articles = ({ page = 1, limit = 10}: ArticlesProps) => {
    const { data, isLoading, isFetching, isError } = useGetArticles(page, limit);

    if (isLoading) return <p>Загрузка...</p>;
    if (isFetching) return <p>Загрузка данных...</p>;
    if (isError) return <p>Ошибка загрузки</p>;

    return (
        <div className={styles.container}>
            {data?.map((article) => (
                <Card article={article}/>
            ))}
        </div>
    );
};

export default Articles;