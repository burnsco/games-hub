import type { Metadata } from "next";
import BackButton from "../../components/BackButton";
import WordRain from "./component";

export const metadata: Metadata = {
  title: "WordRain",
  description:
    "Test your typing speed and accuracy with WordRain. Type the falling words before they hit the ground in this fast-paced linguistic challenge.",
  openGraph: {
    title: "WordRain | Games Hub",
    description: "How fast can you type? Find out with WordRain.",
  },
};

export default function Page() {
  return (
    <>
      <BackButton />
      <WordRain />
    </>
  );
}
