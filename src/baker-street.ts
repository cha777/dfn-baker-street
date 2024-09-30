import puppeteer, { Browser, Page } from 'puppeteer-core';
import { EventEmitter } from 'node:events';
import { OrderOwner, Selector } from './constants';
import logger from './logger';

export class BakerStreet extends EventEmitter {
  url: string;
  executablePath: string;
  browser?: Browser;
  page?: Page;

  constructor() {
    super();

    this.url = Bun.env.BRAINX_URL;
    this.executablePath = Bun.env.BROWSER_EXEC_PATH;
  }

  public async initializePage() {
    this.browser = await puppeteer.launch({
      executablePath: this.executablePath,
      headless: true,
      args: ['--no-sandbox'],
    });

    this.page = await this.browser.newPage();
    this.page.on('console', (msg) => {
      const msgType = msg.type();
      const loggerMsg = `[PAGE LOG]: ${msg.text()}`;

      switch (msgType) {
        case 'error':
          logger.error(loggerMsg);
          break;

        case 'warn':
          logger.warn(loggerMsg);
          break;

        default:
          logger.info(loggerMsg);
          break;
      }
    });

    logger.info('Navigating to login page');
    await this.page.goto(this.url);

    logger.info('Waiting for login page');

    await Promise.all([
      this.page.waitForSelector(Selector.EmailInput),
      this.page.waitForSelector(Selector.PasswordInput),
      this.page.waitForSelector(Selector.LoginButton),
    ]);

    await this.page.waitForNetworkIdle();

    logger.info('Login page ready');

    await this.page.type(Selector.EmailInput, Bun.env.BRAINX_USERNAME);
    await this.page.type(Selector.PasswordInput, Bun.env.BRAINX_PASSWORD);
    await this.page.click(Selector.LoginButton);

    logger.info('Waiting for login in');

    await this.page?.waitForSelector(Selector.OrderOwnerSelection, { visible: true });
    await this.page.waitForSelector(Selector.FoodTypeSelection, { visible: true });

    await this.page.waitForNetworkIdle({ timeout: 60000 });

    logger.info('Baker street loaded');
  }

  public async isOrdersPlaceable() {
    try {
      const element = await this.page?.$$(Selector.OrderSaveButton);
      if (element && element.length > 0) {
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  public async placeOrder(owner: OrderOwner, foodType: string) {
    if (this.page) {
      // await this.selectOwner(owner);
      await this.selectFoodType(foodType);
      await this.page.click(Selector.OrderSaveButton);

      await this.page.waitForFunction(
        (selector) => (document.querySelector(selector as string) as HTMLSelectElement).value === '0',
        {},
        Selector.FoodTypeSelection
      );

      logger.info('Form submitted successfully!');
    }
  }

  public async terminate() {
    logger.info('Terminating browser');
    await this.browser?.close();
  }

  private async selectOwner(owner: OrderOwner) {
    await this.page?.evaluate(
      async ([ownerSelector, colleagueSelector, owner, isColleagueOrder]) => {
        console.log(`Selecting owner: ${owner.toString()}`);

        const dropdown = document.querySelector(ownerSelector as string) as HTMLSelectElement;

        if (dropdown) {
          const options = Array.from(dropdown.options);

          // Find the matching order for option and select it
          const optionToSelect = options.find((option) => option.value === owner.toString());

          if (optionToSelect) {
            dropdown.value = optionToSelect.value;
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));

            if (isColleagueOrder) {
              await this.page?.waitForSelector(colleagueSelector as string, { visible: true });
              const dropdown = document.querySelector(colleagueSelector as string) as HTMLSelectElement;
              const options = Array.from(dropdown.options);

              // TODO: Implement colleague name selection
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
      },
      [Selector.OrderOwnerSelection, Selector.ColleagueSelection, owner, owner === OrderOwner.Colleague]
    );
  }

  private async selectFoodType(foodType: string) {
    await this.page?.evaluate(
      ([selector, foodType]) => {
        console.log(`Selecting food type: ${foodType}`);

        const dropdown = document.querySelector(selector) as HTMLSelectElement;

        if (dropdown) {
          const options = Array.from(dropdown.options);

          // Find the option with the text "Chicken" and select it
          const optionToSelect = options.find((option) => option.text === foodType);

          if (optionToSelect) {
            dropdown.value = optionToSelect.value;
            // Trigger change event manually since Puppeteer doesn't trigger it automatically
            dropdown.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('Food type selection successful');
          } else {
            throw new Error(`Invalid food type ${foodType}`);
          }
        } else {
          throw new Error('Food type dropdown not available');
        }
      },
      [Selector.FoodTypeSelection, foodType]
    );
  }
}
