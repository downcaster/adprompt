declare module 'node-vibrant' {
  export interface Swatch {
    getHex(): string;
  }

  export interface Palette {
    Vibrant?: Swatch | null;
    Muted?: Swatch | null;
    DarkVibrant?: Swatch | null;
    DarkMuted?: Swatch | null;
    LightVibrant?: Swatch | null;
    LightMuted?: Swatch | null;
    [key: string]: Swatch | null | undefined;
  }

  export interface VibrantStatic {
    from(path: string): {
      maxColorCount(count: number): VibrantStatic;
      getPalette(): Promise<Palette>;
    };
  }

  const vibrant: VibrantStatic;
  export default vibrant;
}
