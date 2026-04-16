import BackButton from "../../components/BackButton";
import { PageMeta } from "../../components/PageMeta";
import AsteroidDrift from "./component";

export default function AsteroidDriftPage() {
  return (
    <>
      <PageMeta
        title="Asteroid Drift"
        description="Pilot your ship and dodge incoming rocks in this space survival game."
      />
      <BackButton />
      <AsteroidDrift />
    </>
  );
}
