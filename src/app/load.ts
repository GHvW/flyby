import { initSprite, newTexture, Sprite, Texture } from "./sprite";

function loadSprites(assetPaths: string[]): Promise<Sprite[]> {
    return Promise
        .all(
            assetPaths
                .map(newTexture))
        .then(textures => textures.map(initSprite));
}


export { loadSprites };