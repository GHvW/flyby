import { Sprite } from "./sprite";

function render(ctx: CanvasRenderingContext2D): (sprites: Sprite[]) => void {
    return (sprites) => 
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