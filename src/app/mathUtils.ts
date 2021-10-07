function degreesToRadians(degrees: number): number {
    return (Math.PI / 180) * degrees;
}

function radiansToDegrees(radians: number): number {
    return (180 / Math.PI) * radians;
}

export { degreesToRadians, radiansToDegrees };

