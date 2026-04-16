import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import WhackAMole from "./component";

export default function WhackAMolePage() {
  return (
    <>
      <PageMeta
        title="Whack-a-Mole"
        description="Whack the moles before they disappear in this arcade favorite."
      />
      <BackButton />
      <WhackAMole />
    </>
  );
}
