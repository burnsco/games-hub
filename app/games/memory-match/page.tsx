import type { Metadata } from "next";
import BackButton from "../../components/BackButton";
import MemoryMatch from "./component";

export const metadata: Metadata = {
  title: "Memory Match",
  description:
    "Sharpen your mind with Memory Match. Find pairs of cards as quickly as possible in this fun, brain-training puzzle game.",
  openGraph: {
    title: "Memory Match | Games Hub",
    description: "Test your memory with our card matching game.",
  },
};

export default function Page() {
  return (
    <>
      <BackButton />
      <MemoryMatch />
    </>
  );
}
