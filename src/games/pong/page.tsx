import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import Pong from "./component";

export default function PongPage() {
  return (
    <>
      <PageMeta title="Pong" description="Classic paddle game — beat the AI in your browser." />
      <BackButton />
      <Pong />
    </>
  );
}
