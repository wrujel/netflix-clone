import Image from "next/image";
import avatar from "../public/images/default-blue.png";

interface AvatarProps {
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ className }) => {
  return <Image src={avatar} priority alt="Avatar" className={className} />;
};

export default Avatar;
