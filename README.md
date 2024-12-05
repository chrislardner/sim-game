# Sim Game

Sim Game is a sports simulation web application inspired by games like *Basketball-GM* and *Out of the Park Baseball*. It focuses on managing and simulating university-level **track & field** and **cross country** teams. Players recruit athletes, train them, and compete in events to achieve victory through strategic team management. (title of the project is a WIP, as is the game.)

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [How to Run the Project](#how-to-run-the-project)
- [Game Mechanics](#game-mechanics)
  - [Seasons and Phases](#seasons-and-phases)
  - [Scoring Systems](#scoring-systems)
  - [Playoffs Simulation](#playoffs-simulation)
- [Customizations](#customizations)
- [Future Plans](#future-plans)
- [Acknowledgments](#acknowledgments)

---

## Features

1. **Dynamic Seasons and Playoffs**
   - Simulate cross country and track & field events for multiple weeks, including playoffs.
   - Dynamic schedules with randomly generated meets and participant results.
   - Goals: make schedules, and race results be more realistic and life-like.

2. **Team and Player Management**
   - Goals: Allow the recruiting high school athletes to join your university team.
   - Goals: Manage team schedules, players, and points.

3. **Realistic Scoring Systems**
   - Cross country: Top 5 finishers contribute to team scores, with special rules for missing participants.
   - Track & field: Points awarded by placement for top 6 participants.

4. **Interactive Player Profiles**
   - Randomly generated cartoon faces for players using [faces.js](https://github.com/zengm-games/facesjs).
   - Goals: Individual stats, skills, and points updated dynamically based on race performance.

5. **Dark Mode and Modern UI**
   - TailwindCSS-powered UI with dark mode support and a clean, customizable aesthetic.
   - Goals: Improve accessibility of navigation of the game.

---

## Technologies Used

- **Frontend**: Next.JS
- **State Management**: Context API and React hooks.
- **Database**: IndexedDB via [idb](https://github.com/jakearchibald/idb) for persistent storage.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/).
- **Testing**: Jest for unit and integration testing.

---

## Project Structure

The project follows a modular structure with the `src` directory containing all source files. Here’s an overview, it's not up to date.:

```
src/
├── app/
│   ├── layout.tsx          # Main layout with navigation and dark mode toggle
│   ├── page.tsx            # Home page with options to start/load a game
│   ├── game/               # Dynamic routes for game pages
│   │   ├── [gameId]/       # Individual game dashboard
│   │       ├── teams/          # Pages for team views
│   │       ├── players/        # Pages for player views
├── components/             # Reusable UI components (e.g., Sidebar, Buttons)
├── constants/              # Static data and enums (e.g., race types, phases)
├── data/                   # Database and ID tracking logic, along with some data parsing for names/teams
│   ├── storage.ts          # IndexedDB-based storage
│   ├── idTracker.ts        # ID counters for players, teams, meets, etc. Might not be the best solution for IDs
├── logic/                  # Core game logic
│   ├── scheduleGenerator.ts # Schedule creation for league and teams
│   ├── simulation.ts       # Week-by-week simulation logic
│   ├── scoring.ts          # Scoring systems for events
│   ├── playoffs.ts         # Playoff simulation logic
├── styles/                 # Tailwind CSS setup and global styles
├── types/                  # TypeScript interfaces for Game, Team, Player, etc.
```

---

## How to Run the Project

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/wyochris/sim-game.git
   cd sim-game
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

4. **Run Tests**:
   ```bash
   npm run test
   ```

5. **Build for Production**:
   ```bash
   npm run build
   ```
---

## Game Mechanics

### Seasons and Phases

The game operates on a **yearly cycle**, broken into the following phases:

1. **Cross Country Season (Weeks 1–9)**:
   - Weekly meets where top 5 participants contribute to team scores.
   - Scoring favors lower times (1st place = 1 point).

2. **Playoffs (Weeks 9–10)**:
   - All teams start in the first round.
   - Winners advance based on team points in playoff meets until a champion is crowned.

3. **Offseason (Weeks 11–13)**:
   - End-of-season awards and team management.

4. **Track & Field Season (Weeks 14–38)**:
   - Weekly meets with track events.
   - Points awarded for top 6 finishers in each event.

5. **Track & Field Playoffs (Weeks 39–40)**:
   - Similar to cross country playoffs but based on track events.

6. **Final Offseason (Weeks 41–52)**:
   - End-of-season awards and team management.

---

### Scoring Systems

#### Cross Country

- **Individual Scoring**:
  - Top 5 participants for each team are marked as `team_top_five`.
  - The position determines the points directly (eg: first place gets 1 point, second place gets 2 points, etc.).

- **Team Scoring**:
  - Sum of `team_top_five` scores determines team points.
  - The team with the least points wins.

#### Track & Field

- **Individual Scoring**:
  - Points awarded for top 6 places: 1st = 10, 2nd = 8, ..., 6th = 1.

- **Team Scoring**:
  - Total team points are the sum of individual scores.
  - The team with the most points wins.

---

## Customizations

- **Player Faces**:
  - Uses [faces.js](https://github.com/zengm-games/facesjs) to generate random cartoon faces for each player.

- **Dark Mode**:
  - Persistent across sessions, with styles by TailwindCSS.

- **Dynamic Routing**:
  - Each game, team, and player has its own detailed page.

---

## Future Plans

1. **Customizable Color Palettes**:
   - Allow players to customize the UI theme.

2. **Advanced Recruiting System**:
   - Incorporate player stats, loyalty, and other factors into recruiting.

3. **Live Simulations**:
   - Visualize races and track events week by week.

4. **Player Development**:
   - Track training progress and implement skill growth. (WIP)

---

## Acknowledgments

- **Inspiration**:
  - Basketball-GM, Out of the Park Baseball
- **Libraries**:
  - faces.js for player avatars.
  - idb for IndexedDB storage.

---

Enjoy managing your championship-winning teams! 🎉 Let me know if you’d like any refinements! Contact me at lardnece@rose-hulman.edu
