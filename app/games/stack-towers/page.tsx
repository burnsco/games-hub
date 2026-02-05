import BackButton from "../../components/BackButton";
import ComingSoon from "../../components/ComingSoon";

export default function Page() {
  return (
    <>
      <BackButton />
      <ComingSoon
        title="Stack Towers"
        emoji="🧱"
        description="Drop blocks carefully and build the tallest tower."
      />
    </>
  );
}
