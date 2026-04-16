import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import WordRain from "./component";

export default function WordRainPage() {
  return (
    <>
      <PageMeta
        title="WordRain"
        description="Test your typing speed and accuracy with WordRain. Type the falling words before they hit the ground in this fast-paced linguistic challenge."
        ogTitle="WordRain | Games Hub"
        ogDescription="How fast can you type? Find out with WordRain."
      />
      <BackButton />
      <WordRain />
    </>
  );
}
