import styles from "./TasksAndTests.module.css";
import { useGetTasks } from '../../hooks/useGetTasks';
import { useGetTests } from '../../hooks/useGetTests';
import Card from '../Card/Card';

type TasksAndTestsProps = {
    page?: number;
    limit?: number;
}

const TasksAndTests = ({ page = 1, limit = 10}: TasksAndTestsProps) => {
    const { data: tasksData, isLoading: isLoadingTasks, isError: isErrorTasks } = useGetTasks(page, limit);
    const { data: testsData, isLoading: isLoadingTests, isError: isErrorTests } = useGetTests(page, limit);

    if (isLoadingTasks || isLoadingTests) return <p>Загрузка...</p>;
    if (isErrorTasks || isErrorTests) return <p>Ошибка загрузки</p>;

    const limitedTasks = tasksData?.slice(0, 5) || [];
    const limitedTests = testsData?.slice(0, 5) || [];

    const mixedData = [...limitedTasks, ...limitedTests]
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

    return (
        <div className={styles.container}>
            {mixedData?.map((item) => (
                <Card data={item}/>
            ))}
        </div>
    );
};

export default TasksAndTests;