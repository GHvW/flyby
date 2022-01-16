import { Observable, Subscriber } from "rxjs";

interface GameTime {
    currentTime: number;
    deltaTime: number;
}

const gameLoop = (subscriber: Subscriber<GameTime>, last: number) => (timeStamp: DOMHighResTimeStamp) => {
    const currentTime = timeStamp / 1000;
    // const currentTime = timeStamp;
    const deltaTime = currentTime - last;

    window.requestAnimationFrame(gameLoop(subscriber, currentTime));

    subscriber.next({
        currentTime: currentTime,
        deltaTime: deltaTime,
    });
}


// switch to animationFrames observable at some point https://rxjs.dev/api/index/function/animationFrames
const gameLoop$: Observable<GameTime> =
    new Observable(subscriber => {
        let loop = gameLoop(subscriber, 0);
        window.requestAnimationFrame(loop);
    });


export { gameLoop$, GameTime };