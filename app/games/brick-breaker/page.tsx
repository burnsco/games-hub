import BackButton from "../../components/BackButton";
import ComingSoon from "../../components/ComingSoon";

export default function Page() {
  return (
    <>
      <BackButton />
      <ComingSoon
        title="Brick Breaker"
        emoji="🧱"
        description="Bounce the ball, clear the bricks, and chase high scores."
      />
    </>
  );
}
