import { Movement } from "./controlStreams";
import { GameTime } from "./gameLoop";
import { Sprite } from "./sprite";
import { GameWorld } from "./world";

function update(world: GameWorld, [time, movement]: [GameTime, Movement]): GameWorld {
    const newSprites: Sprite[] = world.sprites.map(sprite => { 
        let coords = sprite.coordinates;
        let newCoords = coords;
        // console.log("new coords: ", newCoords);

        if (movement === Movement.Down) {
        newCoords = { x: coords.x, y: coords.y + 1 };
        }
        else if (movement === Movement.DownLeft) {
            newCoords = { x: coords.x - 1, y: coords.y + 1 };           
        }
        else if (movement === Movement.DownRight) {
            newCoords = { x: coords.x + 1, y: coords.y + 1 };           
        }
        else if (movement === Movement.Left) {
            newCoords = { x: coords.x - 1, y: coords.y  };           
        }
        else if (movement === Movement.UpLeft) {
            newCoords = { x: coords.x - 1, y: coords.y - 1 };           
        }
        else if (movement === Movement.UpRight) {
            newCoords = { x: coords.x + 1, y: coords.y - 1 };           
        }
        else if (movement === Movement.Up) {
            newCoords = { x: coords.x, y: coords.y - 1 };           
        }
        else if (movement === Movement.Right) {
            newCoords = { x: coords.x + 1, y: coords.y };           
        }

        return { ...sprite, coordinates: newCoords };
    });

    return { sprites: newSprites };
}