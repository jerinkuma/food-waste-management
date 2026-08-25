import Navbar from "../../components/Navbar/Navbar";
import Hero from "../../components/Hero/Hero";
import About from "../../components/About/About";
import HowItWorks from "../../components/HowItWorks/HowItWorks";
import Impact from "../../components/Impact/Impact";
import Services from "../../components/Services/Services";
import Contact from "../../components/Contact/Contact";
import Footer from "../../components/Footer/Footer";
import ScrollProgress from "../../components/ScrollProgress/ScrollProgress";

const Home = () => {
  return (
    <>
        <ScrollProgress />
        <Navbar />
        <Hero />
        <About />
        <HowItWorks />
        <Impact />
        <Services />
        <Contact />
        <Footer />
    </>
  );
};

export default Home;