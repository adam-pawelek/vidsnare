// Vite turns imported images into URLs.
declare module '*.svg' {
  const url: string
  export default url
}
