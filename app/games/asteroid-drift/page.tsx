import BackButton from "../../components/BackButton";
import ComingSoon from "../../components/ComingSoon";

export default function Page() {
  return (
    <>
      <BackButton />
      <ComingSoon
        title="Asteroid Drift"
        emoji="☄️"
        description="Steer your ship through an asteroid field and survive the drift."
      />
    </>
  );
}
