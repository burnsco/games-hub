import { Helmet } from "react-helmet-async";
import ComingSoon from "../components/ComingSoon";

export default function LeaderboardPage() {
  return (
    <>
      <Helmet>
        <title>Leaderboard | Games Hub</title>
        <meta
          name="description"
          content="Global leaderboard for Games Hub — compete across instant browser games."
        />
        <meta property="og:title" content="Leaderboard | Games Hub" />
      </Helmet>
      <ComingSoon
        title="Leaderboard"
        emoji="🏆"
        description="Global high scores are coming soon. Play games now and your scores will be waiting."
      />
    </>
  );
}
