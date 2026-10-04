export default function manifest() {
  return {
    name: "Report Now - Community Issue Reporting",
    short_name: "Report Now",
    description:
      "Empowering citizens to report, track, and resolve municipal and community issues effortlessly.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#2563eb",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
