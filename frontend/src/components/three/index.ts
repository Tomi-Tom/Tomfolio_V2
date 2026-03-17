import dynamic from "next/dynamic";

export const GearScene = dynamic(() => import("./GearScene"), { ssr: false });
