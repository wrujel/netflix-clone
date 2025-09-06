import Image from "next/image";
import { BsFillPlayFill } from "react-icons/bs";
import FavoriteButton from "./FavoriteButton";
import { useRouter } from "next/navigation";
import useInfoModal from "../hooks/useInfoModal";
import { BiChevronDown } from "react-icons/bi";

interface MovieCardProps {
  data: Record<string, any>;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
  const router = useRouter();
  const { openModal } = useInfoModal();

  return (
    <div className="group bg-zin-900 col-span relative h-[12vw]">
      <Image
        className="
          cursor-pointer
          object-cover
          transition
          duration-200
          shadow-xl
          rounded-md
          group-hover:opacity-90
          sm:group-hover:opacity-0
          delay-100
          w-full
          h-[12vw]
        "
        src={data.thumbnailUrl}
        alt="Thumbnail"
        priority
        fill
        sizes="25vw"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mOU+g8AATkBG5//A4sAAAAASUVORK5CYII="
      />
      <div
        className="
          opacity-0
          absolute
          top-0
          transition
          duration-200
          z-10
          invisible
          sm:visible
          delay-100
          w-full
          h-[12vw]
          scale-0
          group-hover:scale-110
          group-hover:-translate-y-[6vw]
          
          group-hover:opacity-100
        "
      >
        <Image
          className="
            cursor-pointer
            object-cover
            transition
            duration-200
            shadow-xl
            rounded-t-md
            w-full
            h-[12vw]
          "
          src={data.thumbnailUrl}
          alt="Thumbnail"
          priority
          fill
          sizes="25vw"
        />
        <div
          className="
            z-10
            bg-zinc-800
            p-2
            lg:p-4
            absolute
            top-[11.8vw]
            w-full
            transition
            shadow-md
            rounded-b-md
            duration-200
            flex
            flex-col
            justify-between
            items-start
            gap-4
          "
        >
          <div className="flex flex-row items-center gap-3">
            <div
              onClick={() => router.push(`/watch/${data?.id}`)}
              className="
                cursor-pointer
                w-6
                h-6
                lg:w-10
                lg:h-10
                bg-white
                rounded-full
                flex
                justify-center
                items-center
                transition
                hover:bg-neutral-300
              "
            >
              <BsFillPlayFill size={30} />
            </div>
            <FavoriteButton movieId={data.id} />
            <div
              onClick={() => openModal(data?.id)}
              className="
                cursor-pointer
                group/item
                w-6
                h-6
                lg:w-10
                lg:h-10
                border-white
                border-2
                rounded-full
                flex
                justify-center
                items-center
                transition
                hover:border-neutral-300
              "
            >
              <BiChevronDown
                className="text-white group-hover/item:text-neutral-300"
                size={30}
              />
            </div>
          </div>
          <p className="text-green-400 font-semibold">
            New <span className="text-white">2023</span>
          </p>
          <div className="flex flex-row">
            <div className="text-white">
              <ul className="list-disc list-inside flex flex-row">
                <li className="text-[8px] list-none lg:text-sm">
                  {data.genre}
                </li>
                <li className="text-[10px] lg:text-sm ml-4">{data.duration}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
