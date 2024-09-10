import { OrderOwner } from './constants';

export class UserSelection {
  type: OrderOwner;
  colleagueName?: string;

  constructor(type: OrderOwner, colleagueName?: string) {
    this.type = type;

    if (type === OrderOwner.Colleague) {
      if (!!colleagueName) {
        throw new Error('Invalid order owner');
      }

      this.colleagueName = colleagueName;
    }
  }
}
