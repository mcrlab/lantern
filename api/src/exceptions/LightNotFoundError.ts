export default class LightNotFoundError {
    status:number;
    message:string;

    constructor(message:string = 'Light not found'){
      this.status = 404;
      this.message = message;
    }
  }
  