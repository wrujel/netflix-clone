import Image from "next/image";
import { BsFillPlayFill } from "react-icons/bs";

interface MovieCardProps {
  data: Record<string, any>;
}

const MovieCard: React.FC<MovieCardProps> = ({ data }) => {
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
          delay-300
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
          delay-300
          w-full
          h-[12vw]
          scale-0
          group-hover:scale-110
          group-hover:-translate-y-[6vw]
          group-hover:translate-x-[2vw]
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
          "
        >
          <div className="flex flex-row items-center gap-3">
            <div
              onClick={() => {}}
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
            <p className="text-green-400 font-semibold ml-2">
              New <span className="text-white">2023</span>
            </p>
            <div className="flex flex-row ml-3 gap-2 items-center">
              <p className="text-white text-[10px] lg:text-sm">
                {data.duration}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
