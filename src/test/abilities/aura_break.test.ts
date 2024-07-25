import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import Phaser from "phaser";
import GameManager from "#app/test/utils/gameManager";
import Overrides from "#app/overrides";
import { Species } from "#enums/species";
import { MoveEffectPhase } from "#app/phases";
import { Moves } from "#enums/moves";
import { getMovePosition } from "#app/test/utils/gameManagerUtils";
import { Abilities } from "#enums/abilities";
import { allMoves } from "#app/data/move.js";
import { SPLASH_ONLY } from "../utils/testUtils";

describe("Abilities - Aura Break", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

  const auraBreakMultiplier = 9/16 * 4/3;

  beforeAll(() => {
    phaserGame = new Phaser.Game({
      type: Phaser.HEADLESS,
    });
  });

  afterEach(() => {
    game.phaseInterceptor.restoreOg();
  });

  beforeEach(() => {
    game = new GameManager(phaserGame);
    game.override.battleType("single");
    vi.spyOn(Overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([Moves.MOONBLAST, Moves.DARK_PULSE, Moves.MOONBLAST, Moves.DARK_PULSE]);
    game.override.enemyMoveset(SPLASH_ONLY);
    game.override.enemyAbility(Abilities.AURA_BREAK);
    game.override.enemySpecies(Species.SHUCKLE);
  });

  it("reverses the effect of fairy aura", async () => {
    const moveToCheck = allMoves[Moves.MOONBLAST];
    const basePower = moveToCheck.power;

    vi.spyOn(Overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.FAIRY_AURA);
    vi.spyOn(moveToCheck, "calculateBattlePower");

    await game.startBattle([Species.PIKACHU]);
    game.doAttack(getMovePosition(game.scene, 0, Moves.MOONBLAST));
    await game.phaseInterceptor.to(MoveEffectPhase);

    expect(moveToCheck.calculateBattlePower).toHaveReturnedWith(expect.closeTo(basePower * auraBreakMultiplier));
  });

  it("reverses the effect of dark aura", async () => {
    const moveToCheck = allMoves[Moves.DARK_PULSE];
    const basePower = moveToCheck.power;

    vi.spyOn(Overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.DARK_AURA);
    vi.spyOn(moveToCheck, "calculateBattlePower");

    await game.startBattle([Species.PIKACHU]);
    game.doAttack(getMovePosition(game.scene, 0, Moves.DARK_PULSE));
    await game.phaseInterceptor.to(MoveEffectPhase);

    expect(moveToCheck.calculateBattlePower).toHaveReturnedWith(expect.closeTo(basePower * auraBreakMultiplier));
  });
});
