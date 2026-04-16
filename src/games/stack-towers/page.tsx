import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import StackTowers from "./component";

export default function StackTowersPage() {
  return (
    <>
      <PageMeta
        title="Stack Towers"
        description="Drop blocks and build the tallest stack you can."
      />
      <BackButton />
      <StackTowers />
    </>
  );
}
