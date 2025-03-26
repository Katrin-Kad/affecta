import { Link } from "react-router-dom";

const About = () => {
  return (
    <div>
      <h1>О нас</h1>
      <p>Здесь будет информация о проекте.</p>
      <Link to="/">На главную</Link>
    </div>
  );
};

export default About;
