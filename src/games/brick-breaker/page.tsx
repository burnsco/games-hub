import { PageMeta } from "../../components/PageMeta";
import BrickBreakerGame from "./component";

export default function BrickBreakerPage() {
  return (
    <>
      <PageMeta
        title="Brick Breaker"
        description="Relive the arcade classic. Bounce the ball, break the bricks, and clear the screen in this addictive browser-based Brick Breaker game."
        ogTitle="Brick Breaker | Games Hub"
        ogDescription="Break the bricks and score points in this arcade classic."
      />
      <BrickBreakerGame />
    </>
  );
}
