export interface Config {
    VIEW_PIN: Number,
    NUMBER_OF_PIXELS: Number,
    RENDER_INTERVAL: Number,
    SLEEP_INTERVAL: Number,
    BACKUP_INTERVAL: Number,
  }

  
interface Light {
    x: number,
    y: Number,
    id: number,
    address: String,
    color: String,
    lastUpdated: string,
  }
  export default Light