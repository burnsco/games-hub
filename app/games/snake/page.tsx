import type { Metadata } from "next";
import BackButton from "../../components/BackButton";
import Snake from "./component";

export const metadata: Metadata = {
  title: "Snake",
  description:
    "Play the classic Snake game instantly in your browser. Eat apples, grow longer, and try not to hit the walls or yourself!",
  openGraph: {
    title: "Snake | Games Hub",
    description: "Play the classic Snake game instantly in your browser.",
  },
};

export default function Page() {
  return (
    <>
      <BackButton />
      <Snake />
    </>
  );
}
