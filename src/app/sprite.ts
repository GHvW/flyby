import { Coordinate } from "./coordinate";

interface Texture {
    img: HTMLImageElement
}

interface Sprite {
    texture: Texture;
    coordinates: Coordinate
}

function newTexture(path: string): Promise<Texture> {
    let img = new Image();
    img.src = path;
    // TODO - reject case
    return new Promise((resolve, _) => {
        img.addEventListener("load", _ => {
            resolve({ img: img });
        });
    })

}


function initSprite(texture: Texture): Sprite {
    return {
        texture: texture,
        coordinates: { x: 150, y: 150 }
    }
}

export { newTexture, Sprite, Texture, initSprite };