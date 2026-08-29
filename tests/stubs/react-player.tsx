type ReactPlayerStubProps = {
  src?: string;
  loop?: boolean;
  playing?: boolean;
  muted?: boolean;
  controls?: boolean;
  volume?: number;
  width?: number | string;
  height?: number | string;
};

/**
 * Test double for `react-player`. The real player mounts custom media elements
 * (hls/youtube/vimeo web components) that jsdom cannot define, so tests render
 * the props onto a <video> and assert against that.
 */
const ReactPlayerStub = ({
  src,
  loop,
  playing,
  muted,
  controls,
  volume,
  width,
  height,
}: ReactPlayerStubProps) => (
  <video
    data-testid="react-player"
    src={src}
    loop={loop}
    muted={muted}
    controls={controls}
    data-playing={playing ? "true" : "false"}
    data-volume={volume}
    data-width={width}
    data-height={height}
  />
);

export default ReactPlayerStub;
