import BackButton from "../../components/BackButton";
import ComingSoon from "../../components/ComingSoon";

export default function Page() {
  return (
    <>
      <BackButton />
      <ComingSoon
        title="2048 Lite"
        emoji="🧩"
        description="Slide tiles to merge and climb to the 2048 goal."
      />
    </>
  );
}
