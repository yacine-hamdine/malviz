import { Link } from "react-router-dom";
import Logo from "../assets/logos/malviz.svg";

function Header() {
    return (
        <header>
            <div id="logo" className="subtitle">
                <Link to="/">
                    <img src={Logo} alt="Logo" />
                </Link>
            </div>
            <div>
                <Link to="/submit">
                    <button className="button">Submit</button>  
                </Link>
            </div>
        </header>
    );
}

export default Header;