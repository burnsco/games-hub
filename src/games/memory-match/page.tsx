import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import MemoryMatch from "./component";

export default function MemoryMatchPage() {
  return (
    <>
      <PageMeta
        title="Memory Match"
        description="Sharpen your mind with Memory Match. Find pairs of cards as quickly as possible in this fun, brain-training puzzle game."
        ogTitle="Memory Match | Games Hub"
        ogDescription="Test your memory with our card matching game."
      />
      <BackButton />
      <MemoryMatch />
    </>
  );
}
