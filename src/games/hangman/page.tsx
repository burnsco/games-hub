import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import Hangman from "./component";

export default function HangmanPage() {
  return (
    <>
      <PageMeta
        title="Hangman"
        description="Guess letters before the drawing is complete in this word puzzle classic."
      />
      <BackButton />
      <Hangman />
    </>
  );
}
