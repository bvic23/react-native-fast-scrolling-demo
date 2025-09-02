const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

export class Point {
    readonly x: number;
    readonly y: number;

    static readonly zero = new Point(0, 0);

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        Object.freeze(this);
    }

    get absX(): number {
        return Math.abs(this.x);
    }
    get absY(): number {
        return Math.abs(this.y);
    }

    subtract(point: Point): Point {
        return new Point(this.x - point.x, this.y - point.y);
    }

    clamp(min: Point, max: Point): Point {
        return new Point(clamp(this.x, min.x, max.x), clamp(this.y, min.y, max.y));
    }

    clone(): Point {
        return new Point(this.x, this.y);
    }

    multiply(scalar: number): Point {
        return new Point(this.x * scalar, this.y * scalar);
    }

    divide(scalar: number): Point {
        return new Point(this.x / scalar, this.y / scalar);
    }

    distanceTo(point: Point): number {
        const diff = this.subtract(point);
        return Math.sqrt(Math.pow(diff.x, 2) + Math.pow(diff.y, 2));
    }
}
