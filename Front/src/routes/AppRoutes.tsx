import { BrowserRouter, Routes, Route } from "react-router-dom";
import Main from "../pages/Main/Main";
import About from "../pages/About";
import NotFound from "../pages/NotFound";
import Headers from "../components/Headers/Headers";
import Footer from "../components/Footer/footer";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Headers />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default AppRoutes;
