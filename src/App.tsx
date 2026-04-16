import { Route, Routes } from "react-router-dom";
import RootLayout from "./RootLayout";
import HomePage from "./pages/HomePage";
import BugSquashPage from "./games/bug-squash/page";
import WordRainPage from "./games/word-rain/page";
import MemoryMatchPage from "./games/memory-match/page";
import SnakePage from "./games/snake/page";
import PongPage from "./games/pong/page";
import HangmanPage from "./games/hangman/page";
import BrickBreakerPage from "./games/brick-breaker/page";
import AsteroidDriftPage from "./games/asteroid-drift/page";
import ColorSwitchPage from "./games/color-switch/page";
import TetrisPage from "./games/tetris/page";
import WhackAMolePage from "./games/whack-a-mole/page";
import StackTowersPage from "./games/stack-towers/page";
import CoinsDicePage from "./games/coins-dice/page";
import LeaderboardPage from "./pages/LeaderboardPage";

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/games/bug-squash" element={<BugSquashPage />} />
        <Route path="/games/word-rain" element={<WordRainPage />} />
        <Route path="/games/memory-match" element={<MemoryMatchPage />} />
        <Route path="/games/snake" element={<SnakePage />} />
        <Route path="/games/pong" element={<PongPage />} />
        <Route path="/games/hangman" element={<HangmanPage />} />
        <Route path="/games/brick-breaker" element={<BrickBreakerPage />} />
        <Route path="/games/asteroid-drift" element={<AsteroidDriftPage />} />
        <Route path="/games/color-switch" element={<ColorSwitchPage />} />
        <Route path="/games/tetris" element={<TetrisPage />} />
        <Route path="/games/whack-a-mole" element={<WhackAMolePage />} />
        <Route path="/games/stack-towers" element={<StackTowersPage />} />
        <Route path="/games/coins-dice" element={<CoinsDicePage />} />
      </Route>
    </Routes>
  );
}
