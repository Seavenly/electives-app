/** MongoDB Configuration File */
interface IMongoDBConfig {
  /** Full address to MongoDB cloud database */
  address: string;
}

declare module '*/mongodb.json' {
  const value: IMongoDBConfig;
  export default value;
}
