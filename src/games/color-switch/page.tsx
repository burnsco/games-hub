import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import ColorSwitch from "./component";

export default function ColorSwitchPage() {
  return (
    <>
      <PageMeta
        title="Color Switch"
        description="Tap to pass only matching colors in this reflex challenge."
      />
      <BackButton />
      <ColorSwitch />
    </>
  );
}
