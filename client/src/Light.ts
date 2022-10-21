interface Config {
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
    name: String,
    color: String,
    version: String,
    platform: String,
    memory: Number,
    sleep: Number,
    lastUpdated: string,
    config: Config
  }
  export default Light