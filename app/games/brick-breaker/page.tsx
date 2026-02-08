import type { Metadata } from "next";
import BrickBreakerGame from "./component";

export const metadata: Metadata = {
  title: "Brick Breaker",
  description:
    "Relive the arcade classic. Bounce the ball, break the bricks, and clear the screen in this addictive browser-based Brick Breaker game.",
  openGraph: {
    title: "Brick Breaker | Games Hub",
    description: "Break the bricks and score points in this arcade classic.",
  },
};

export default function Page() {
  return <BrickBreakerGame />;
}
