import dynamic from "next/dynamic";

export const SectionCanvas = dynamic(() => import("./SectionCanvas"), {
  ssr: false,
});
