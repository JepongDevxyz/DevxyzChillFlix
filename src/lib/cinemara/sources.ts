// Streaming source registry — ad-free embed sources with automatic fallback.
// Each source builds an embed URL from a TMDB id + media type.

export interface SourceDef {
  key: string;
  label: string;
  /** Build the embed URL. Returns "" when the source can't serve this type. */
  build: (type: "movie" | "tv", id: number, season?: number, episode?: number) => string;
}

const num = (v?: number) => (v && v > 0 ? v : 1);

export const SOURCES: SourceDef[] = [
  {
    key: "moviepire",
    label: "MoviePire",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://video.moviepire.co/movie/${id}`
        : `https://video.moviepire.co/tv/${id}/${num(s)}/${num(e)}`,
  },
  {
    key: "vidsrc-party",
    label: "VidSrc Party",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.party/embed/movie/${id}`
        : `https://vidsrc.party/embed/tv/${id}/${num(s)}/${num(e)}`,
  },
  {
    key: "streamzlive",
    label: "StreamZLive",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://streamzlive.xyz/watch.php?id=${id}&type=movie`
        : `https://streamzlive.xyz/watch.php?id=${id}&type=tv&s=${num(s)}&e=${num(e)}`,
  },
  // ---- backups ----
  {
    key: "multiembed",
    label: "MultiEmbed",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${num(s)}&e=${num(e)}`,
  },
  {
    key: "vidsrc-su",
    label: "VidSrc.su",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.su/embed/movie/${id}`
        : `https://vidsrc.su/embed/tv/${id}/${num(s)}/${num(e)}`,
  },
  {
    key: "vidlink",
    label: "VidLink Pro",
    build: (type, id, s, e) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${num(s)}/${num(e)}`,
  },
];

// Live TV channels — free, ad-light public streams (embedded players).
export interface LiveChannel {
  name: string;
  category: string;
  logo: string;
  embed: string;
}

export const LIVE_CHANNELS: LiveChannel[] = [
  { name: "Al Jazeera English", category: "News", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Al_Jazeera_English_logo.svg/512px-Al_Jazeera_English_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCNye-wNBqNL5ZzHSJj3l8Bg&autoplay=1&mute=0" },
  { name: "DW English", category: "News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/512px-Deutsche_Welle_symbol_2012.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCknLrEdhRCp1aegoMqRaCZg&autoplay=1&mute=0" },
  { name: "TRT World", category: "News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/TRT_World_logo.svg/512px-TRT_World_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UC7fWeaHhqgM4Ry-RMpM2YYw&autoplay=1&mute=0" },
  { name: "NASA TV", category: "Science", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCLA_DiR1FfKNvjuUpBHmylQ&autoplay=1&mute=0" },
  { name: "Red Bull TV", category: "Sports", logo: "https://upload.wikimedia.org/wikipedia/en/thumb/1/11/Red_Bull_TV_logo.svg/512px-Red_Bull_TV_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCblfuW_4rakIf2h6aqANefA&autoplay=1&mute=0" },
  { name: "Tasty", category: "Lifestyle", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Tasty_logo.svg/512px-Tasty_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCJFp8uSYCjXOMnkUyb3CQ3Q&autoplay=1&mute=0" },
  { name: "ABC News", category: "News", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/ABC_News_logo.svg/512px-ABC_News_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCBi2mrWuNuyYy4gbM6fU18Q&autoplay=1&mute=0" },
  { name: "Bloomberg TV", category: "Business", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Bloomberg_logo.svg/512px-Bloomberg_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCIALMKvObZNtJ6AmdCLP7Lg&autoplay=1&mute=0" },
  { name: "FashionTV", category: "Lifestyle", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/FashionTV_logo.svg/512px-FashionTV_logo.svg.png", embed: "https://www.youtube.com/embed/live_stream?channel=UC5sVDZjlBbpmxTEFmLU3dOQ&autoplay=1&mute=0" },
  { name: "The Pet Collective", category: "Entertainment", logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/The_Pet_Collective_logo.png/512px-The_Pet_Collective_logo.png", embed: "https://www.youtube.com/embed/live_stream?channel=UCPIvT-zcQl2H0vabdOxJGzw&autoplay=1&mute=0" },
];
