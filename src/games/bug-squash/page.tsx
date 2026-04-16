import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import BugSquash from "./component";

export default function BugSquashPage() {
  return (
    <>
      <PageMeta
        title="Bug Squash"
        description="Squash bugs as fast as you can in this quick-reflex arcade game."
      />
      <BackButton />
      <BugSquash />
    </>
  );
}
