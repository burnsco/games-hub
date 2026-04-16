import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import Snake from "./component";

export default function SnakePage() {
  return (
    <>
      <PageMeta
        title="Snake"
        description="Play the classic Snake game instantly in your browser. Eat apples, grow longer, and try not to hit the walls or yourself!"
        ogTitle="Snake | Games Hub"
        ogDescription="Play the classic Snake game instantly in your browser."
      />
      <BackButton />
      <Snake />
    </>
  );
}
