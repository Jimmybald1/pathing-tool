import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from "vitest";
import GameManager from "#test/utils/gameManager";
import { getMovePosition } from "#test/utils/gameManagerUtils";
import Overrides from "#app/overrides";
import { Moves } from "#enums/moves";
import { Abilities } from "#enums/abilities";
import { Species } from "#enums/species";
import { Status, StatusEffect } from "#app/data/status-effect.js";
import { TurnEndPhase } from "#app/phases.js";
import { QuietFormChangePhase } from "#app/form-change-phase.js";

const TIMEOUT = 20 * 1000;

describe("Abilities - SHIELDS DOWN", () => {
  let phaserGame: Phaser.Game;
  let game: GameManager;

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
    const moveToUse = Moves.SPLASH;
    game.override.battleType("single");
    vi.spyOn(Overrides, "ABILITY_OVERRIDE", "get").mockReturnValue(Abilities.SHIELDS_DOWN);
    vi.spyOn(Overrides, "MOVESET_OVERRIDE", "get").mockReturnValue([moveToUse]);
    game.override.enemyMoveset([Moves.TACKLE, Moves.TACKLE, Moves.TACKLE, Moves.TACKLE]);
  });

  test(
    "check if fainted pokemon switched to base form on arena reset",
    async () => {
      const meteorForm = 0,
        coreForm = 7;
      game.override.startingWave(4);
      vi.spyOn(Overrides, "STARTER_FORM_OVERRIDES", "get").mockReturnValue({
        [Species.MINIOR]: coreForm,
      });

      await game.startBattle([Species.MAGIKARP, Species.MINIOR]);

      const minior = game.scene.getParty().find((p) => p.species.speciesId === Species.MINIOR);
      expect(minior).not.toBe(undefined);
      expect(minior.formIndex).toBe(coreForm);

      minior.hp = 0;
      minior.status = new Status(StatusEffect.FAINT);
      expect(minior.isFainted()).toBe(true);

      game.doAttack(getMovePosition(game.scene, 0, Moves.SPLASH));
      await game.doKillOpponents();
      await game.phaseInterceptor.to(TurnEndPhase);
      game.doSelectModifier();
      await game.phaseInterceptor.to(QuietFormChangePhase);

      expect(minior.formIndex).toBe(meteorForm);
    },
    TIMEOUT
  );
});
