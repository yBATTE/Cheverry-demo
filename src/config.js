const videoUrl = import.meta.env.VITE_PRESENTATION_VIDEO_URL || "";
const presentationVideo =
  videoUrl.startsWith("https://") ||
  (videoUrl.startsWith("/") && !videoUrl.startsWith("//"))
    ? videoUrl
    : "";
export const config = {
  name: "Cheverry",
  presentationVideo,
  whatsapp: "5491165562728",
  instagram: "https://www.instagram.com/cheverryautos/",
};
export const whatsappFor = (title) =>
  `https://wa.me/${config.whatsapp}?text=${encodeURIComponent(title ? `Hola, quiero información sobre el curso ${title}.` : "Hola, quiero información sobre los cursos de Academia Chéverry.")}`;
export const whatsappUrl = whatsappFor();
