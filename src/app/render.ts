import { Sprite } from "./sprite";

function render(sprites: Sprite[], ctx: CanvasRenderingContext2D): void {
    sprites
        .forEach(sprite => {
            // console.log("drawing a sprite!");
            ctx.drawImage(
                sprite.texture.img, 
                sprite.coordinates.x, 
                sprite.coordinates.y, 
                75, 
                75);
        }); // todo scaling on sprite
}

export { render };