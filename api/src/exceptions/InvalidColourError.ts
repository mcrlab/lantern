export default class InvalidColorError {
    status:number;
    message:string;

    constructor(message:string = 'Colour is not in a valid format'){
      this.status = 400;
      this.message = message;
    }
  }
  