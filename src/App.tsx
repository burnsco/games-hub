import { Route, Routes } from "react-router-dom";
import RootLayout from "./RootLayout";
import ErrorBoundary from "./components/ErrorBoundary";
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
        <Route
          path="/games/*"
          element={
            <ErrorBoundary>
              <Routes>
                <Route path="bug-squash" element={<BugSquashPage />} />
                <Route path="word-rain" element={<WordRainPage />} />
                <Route path="memory-match" element={<MemoryMatchPage />} />
                <Route path="snake" element={<SnakePage />} />
                <Route path="pong" element={<PongPage />} />
                <Route path="hangman" element={<HangmanPage />} />
                <Route path="brick-breaker" element={<BrickBreakerPage />} />
                <Route path="asteroid-drift" element={<AsteroidDriftPage />} />
                <Route path="color-switch" element={<ColorSwitchPage />} />
                <Route path="tetris" element={<TetrisPage />} />
                <Route path="whack-a-mole" element={<WhackAMolePage />} />
                <Route path="stack-towers" element={<StackTowersPage />} />
                <Route path="coins-dice" element={<CoinsDicePage />} />
              </Routes>
            </ErrorBoundary>
          }
        />
      </Route>
    </Routes>
  );
}
