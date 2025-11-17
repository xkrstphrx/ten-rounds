# Ten Rounds - Phase 10 Card Game

A Phase 10 style card game built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Play Phase 10 against a computer opponent
- Complete phases by laying down sets, runs, and color groups
- Play additional cards on laid-down phases
- Full round progression with scoring
- Mobile-first responsive design
- 10 phases to complete
- Automatic deployment to GitHub Pages

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## How to Play

Phase 10 is a rummy-type card game where players compete to complete 10 different phases. Each phase has specific requirements:

1. **Phase 1**: 2 sets of 3
2. **Phase 2**: 1 set of 3 + 1 run of 4
3. **Phase 3**: 1 set of 4 + 1 run of 4
4. **Phase 4**: 1 run of 7
5. **Phase 5**: 1 run of 8
6. **Phase 6**: 1 run of 9
7. **Phase 7**: 2 sets of 4
8. **Phase 8**: 7 cards of one color
9. **Phase 9**: 1 set of 5 + 1 set of 2
10. **Phase 10**: 1 set of 5 + 1 set of 3

### Game Rules

**On Your Turn:**
1. Draw a card from either the draw pile or discard pile
2. (Optional) Complete your phase if you have the required cards
3. (Optional) Play additional cards on any player's laid-down phases
4. Discard one card to end your turn

**Completing a Phase:**
- Click "Select for Phase" button
- Select cards from your hand that meet your current phase requirements
- Click "Complete Phase" when you have valid cards selected
- Your cards will be laid down on the table

**Playing on Phases:**
- After completing your phase, click "Play on Phase" button
- Click on a set, run, or color group (yours or opponent's)
- Select a card from your hand that can be played on that group
- The card will be added to the group

**Round End:**
- The round ends when any player discards their last card
- Points are calculated based on remaining cards in each player's hand
- Players who completed their phase advance to the next phase
- Click "Next Round" to continue

**Scoring:**
- Number cards (1-9): 5 points each
- Number cards (10-12): 10 points each
- Skip cards: 15 points each
- Wild cards: 25 points each

**Winning:**
- First player to complete all 10 phases wins!

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **GitHub Pages** - Hosting

## License

MIT
