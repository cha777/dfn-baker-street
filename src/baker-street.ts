import puppeteer, { Browser, Page } from 'puppeteer-core';
import { EventEmitter } from 'node:events';
import { OrderOwner, type FoodType } from './constants';

export class BakerStreet extends EventEmitter {
  url: string;
  executablePath: string;
  browser?: Browser;
  page?: Page;

  constructor() {
    super();

    this.url = 'https://brainxhr.com/private/task/cafe-order-food';
    this.executablePath = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
  }

  public async initializePage() {
    this.browser = await puppeteer.launch({
      executablePath: this.executablePath,
      headless: true,
    });

    this.page = await this.browser.newPage();

    console.log('Navigating to login page');
    await this.page.goto(this.url);

    console.log('Waiting for login page');

    await Promise.all([
      this.page.waitForSelector('#txtiSignInEmail'),
      this.page.waitForSelector('#txtiSignInPassword'),
      this.page.waitForSelector('#btnLogin'),
    ]);

    await this.page.waitForNetworkIdle();

    console.log('Login page ready');

    await this.page.type('#txtiSignInEmail', Bun.env.BRAINX_USERNAME);
    await this.page.type('#txtiSignInPassword', Bun.env.BRAINX_PASSWORD);
    await this.page.click('#btnLogin');

    console.log('Waiting for login in');

    await this.page?.waitForSelector('#cphContent_CafeFoodOrderUC_ddOrderFor', { visible: true });
    await this.page.waitForSelector('#cphContent_CafeFoodOrderUC_ddFoodType', { visible: true });

    await this.page.waitForNetworkIdle();

    console.log('Baker street loaded');
  }

  public async isOrdersPlaceable() {
    try {
      const element = await this.page?.$$('#cphContent_CafeFoodOrderUC_btnSave');
      if (element && element.length > 0) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  public async placeOrder(owner: OrderOwner, foodType: FoodType) {
    if (this.page) {
      await this.selectOwner(owner);
      await this.selectFoodType(foodType);
      await this.page.click('#cphContent_CafeFoodOrderUC_btnSave');

      console.log('Form submitted successfully!');
    }
  }

  public async terminate() {
    await this.browser?.close();
  }

  private async selectOwner(owner: OrderOwner) {
    await this.page?.evaluate(async () => {
      const dropdown = document.querySelector('#cphContent_CafeFoodOrderUC_ddOrderFor') as HTMLSelectElement;

      if (dropdown) {
        const options = Array.from(dropdown.options);

        // Find the matching order for option and select it
        const optionToSelect = options.find((option) => option.text === owner.toString());

        if (optionToSelect) {
          dropdown.value = optionToSelect.value;
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));

          if (owner === OrderOwner.Colleague) {
            await this.page?.waitForSelector('#cphContent_CafeFoodOrderUC_ddColleague', { visible: true });
            const dropdown = document.querySelector('#cphContent_CafeFoodOrderUC_ddColleague') as HTMLSelectElement;
            const options = Array.from(dropdown.options);

            const optionToSelect = options.find((option) => option.text === owner.toString());

            if (optionToSelect) {
              dropdown.value = optionToSelect.value;
              dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            } else {
              throw new Error(`Colleague not available: ${owner}`);
            }
          }
        } else {
          throw new Error(`Invalid owner type ${owner.toString()}`);
        }
      } else {
        throw new Error('Owner dropdown not available');
      }
    });
  }

  private async selectFoodType(foodType: FoodType) {
    await this.page?.evaluate(() => {
      const dropdown = document.querySelector('#cphContent_CafeFoodOrderUC_ddFoodType') as HTMLSelectElement;

      if (dropdown) {
        const options = Array.from(dropdown.options);

        // Find the option with the text "Chicken" and select it
        const optionToSelect = options.find((option) => option.text === foodType.toString());

        if (optionToSelect) {
          dropdown.value = optionToSelect.value;
          // Trigger change event manually since Puppeteer doesn't trigger it automatically
          dropdown.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
          throw new Error(`Invalid food type ${foodType.toString()}`);
        }
      } else {
        throw new Error('Food type dropdown not available');
      }
    });
  }
}
