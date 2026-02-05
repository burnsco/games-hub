import BackButton from "../../components/BackButton";
import ComingSoon from "../../components/ComingSoon";

export default function Page() {
  return (
    <>
      <BackButton />
      <ComingSoon
        title="Color Switch"
        emoji="🟣"
        description="Tap to pass through matching colors with perfect timing."
      />
    </>
  );
}
