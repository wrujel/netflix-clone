import Image from "next/image";
import logo from "../public/images/logo.png";

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return <Image src={logo} priority alt="Logo" className={className} />;
};

export default Logo;
