import { Link } from "react-router-dom";
import Bg from '../assets/illustrations/bg.svg';
import '../styles/Home.css';
const Home = () => {
  return (
    <section id='home' className='home'>
        <div className='presentation'>
            <h1 className='title'>The Ultimate <span className="mc">Malware Analysis Platform</span> Assisted by AI</h1>
            <p>
                Created by
                <br />
                <span className="subtitle mc">Yacine Hamdine</span>
                <br />
                <span className="subtitle mc">Abderraouf Chekroun</span>
            </p>
            <Link to="/submit">
                <button className="button">Start</button>  
            </Link>
        </div>
        <div className='bg'>
          <img src={Bg} alt="Background" className='bg' />
        </div>
    </section>
  );
};

export default Home;