/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  LitElement,
  html,
  customElement,
  property,
  CSSResult,
  TemplateResult,
  css,
  PropertyValues,
  internalProperty,
} from 'lit-element';
import {
  HomeAssistant,
  hasConfigOrEntityChanged,
  hasAction,
  LovelaceCardEditor,
  getLovelace,
  LovelaceCard,
  LovelaceCardConfig,
  createThing,
} from 'custom-card-helpers'; // This is a community maintained npm module with common helper functions/types
import { hass } from "card-tools/src/hass";
import './editor';
import './screensaver-card';
import './tablet-clock-card';
import './tablet-notice-card';

import type { TabletCardConfig } from './types';
import { actionHandler } from './action-handler-directive';
import { CARD_VERSION } from './const';
import { localize } from './localize/localize';

/* eslint no-console: 0 */
console.info(
  `%c  tablet-card \n%c  ${localize('common.version')} ${CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

const HELPERS = (window as any).loadCardHelpers ? (window as any).loadCardHelpers() : undefined;

// This puts your card into the UI card picker dialog
(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'tablet-card',
  name: 'Tablet Card',
  description: 'A template custom card for you to create something awesome',
});

// TODO Name your custom element
@customElement('tablet-card')
export class TabletCard extends LitElement {
  CUSTOM_TYPE_PREFIX = "custom:";

  constructor() {
    super();

    this.screenSaverTimeout = null;
    this.showScreenSaver = false;

    this.cards = [];
    this.utilityCards = [];
  }

  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tablet-card-editor');
  }

  public static getStubConfig(): object {
    return {};
  }

  @property({ attribute: false }) public hass!: HomeAssistant;
  @internalProperty() private cards: LovelaceCard[][];
  @internalProperty() private utilityCards: LovelaceCard[];
  @internalProperty() private showScreenSaver: boolean;
  @internalProperty() private screenSaverTimeout: any;
  @internalProperty() private config!: TabletCardConfig;

  // private renderCard(card): LovelaceCard {
  //   let tag = card.type;
  //   if (tag.startsWith(this.CUSTOM_TYPE_PREFIX)) {
  //     tag = tag.substr(this.CUSTOM_TYPE_PREFIX.length);
  //   } else {
  //     tag = `hui-${tag}-card`;
  //   }

  //   console.warn("trying to create a card", card.type, tag);

  //   const cardElement = document.createElement(tag) as LovelaceCard;
  //   cardElement.setConfig(card);
  //   cardElement.hass = hass();

  //   return cardElement;
  // }

  private async renderCard(config: LovelaceCardConfig): Promise<LovelaceCard> {
    let element: LovelaceCard;
    if (HELPERS) {
      element = (await HELPERS).createCardElement(config);
    } else {
      element = createThing(config);
    }
    if (this.hass) {
      element.hass = this.hass;
    }
    // if (element) {
    //   element.addEventListener(
    //     'll-rebuild',
    //     (ev) => {
    //       ev.stopPropagation();
    //       this._rebuildCard(element, config);
    //     },
    //     { once: true },
    //   );
    // }
    const asdasd: any = await element;
    console.warn("ASDASDASDASD", asdasd);
    return await element;
  }

  private async cacheCards(): Promise<void> {
    // prepare cards for rendering
    this.cards = await Promise.all( this.config.columns.map(async (column) => {
      return await Promise.all( column.cards.map((card) => {
        return this.renderCard(card);
      }));
    }));
    this.utilityCards = await Promise.all(this.config.utility_cards.map((card) => {
      return this.renderCard(card);
    }));
  }

  public setConfig(config: TabletCardConfig): void {
    if (!config) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    this.config = {
      name: 'Tablet',
      ...config,
    };

    this._wakeUp()
    this._refresh()

    this.cacheCards()
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    // provide all cards with the updated hass object
    if (changedProps.has("hass")) {
      changedProps.get("hass");

      this.cards.forEach((column) =>
        column.forEach((card) =>
          card.hass = hass()
        )
      );
      this.utilityCards.forEach((card) =>
        card.hass = hass()
      );
    }

    return hasConfigOrEntityChanged(this, changedProps, false);
  }

  protected _sleep(): void {
    this.showScreenSaver = true;
    clearTimeout(this.screenSaverTimeout);

    console.log("Screensaver: Start");
  }

  protected _wakeUp(): void {
    const minutes = (this.config.screensaver_time || 1);
    this.showScreenSaver = false;

    console.log("Screensaver: Stop. Sleep in", minutes, "minutes");

    clearTimeout(this.screenSaverTimeout);
    this.screenSaverTimeout = setTimeout(() => { this._sleep() }, minutes * 60 * 1000);
  }

  protected _refresh(): void {
    if (this.config.auto_refresh_time) {
      const minutes = (this.config.auto_refresh_time);
      setTimeout(() => { window.location.reload() }, minutes * 60 * 1000);

      console.log("Auto reload page in", minutes, "minutes");
    }
  }

  protected render(): TemplateResult | void {
    console.info("Tablet Card Draw")

    const logoHTML = this.config.logo ? html`
      <div class="tablet-card-card">
        <img class="tablet-card-logo" src="${this.config.logo}" />
      </div>
    ` : ``;

    console.warn("status", this.cards, this.utilityCards);

    return html`
      <ha-card
        .actionHandler=${actionHandler({
          hasHold: hasAction(this.config.hold_action),
          hasDoubleClick: hasAction(this.config.double_tap_action),
        })}
        tabindex="0"
        .label=${`Boilerplate: ${this.config.entity || 'No Entity Defined'}`}
        @click="${this._wakeUp}"
      >
        <screensaver-card ?visible=${this.showScreenSaver}></screensaver-card>
        <div class="tablet-card-container">
          <div class="tablet-card-column tablet-card-column-0">
            <div class="tablet-card-column-0-starter">
              ${logoHTML}
              <tablet-clock-card></tablet-clock-card>
            </div>
            <div class="tablet-card-column-0-ender">
              ${this.utilityCards.map((card) =>
                  html`
                    <div class="tablet-card-card">
                      ${ card }
                    </div>
                  `
                )}
            </div>
          </div>
          ${this.cards.map((column, i) =>
            html`
              <div class="tablet-card-column tablet-card-column-${i + 1}" >
                ${column.map((card) =>
                  html`
                    <div class="tablet-card-card">
                      ${ card }
                    </div>
                  `
                )}
              </div>
            `
          )}
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResult {
    return css`
      :root {
        --tablet-card-spacing: 10px;
      }
      .type-custom-tablet-card {
        height: 100%;
        --tablet-card-spacing: 10px;
      }
      .tablet-card-container {
        background: var(--background-color);
        display: flex;
        padding: var(--tablet-card-spacing) var(--tablet-card-spacing) 0;
        height: 100%;
        max-height: 93vh;
      }
      .tablet-card-column {
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 30%;
        margin: 0 var(--tablet-card-spacing);
        overflow: hidden scroll;

        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .tablet-card-column::-webkit-scrollbar {
        display: none;
      }
      .tablet-card-column-0 {
        flex-shrink: 0;
        flex-grow: 0;
        flex-basis: 20%;
        padding: var(--tablet-card-spacing);

        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .tablet-card-column-0-starter,
      .tablet-card-column-0-ender {
        flex-grow: 0;
        flex-shrink: 0;
      }
      .tablet-card-column-0-starter {
        margin-bottom: calc(var(--tablet-card-spacing)*2);
      }

      .tablet-card-card {
        margin: var(--tablet-card-spacing) 0 calc(var(--tablet-card-spacing)*2);
      }
      @media only screen and (max-width: 1000px) {
        .tablet-card-container {
          flex-direction: column;
          height: auto;
          max-height: none;
        }
        .tablet-card-column {
          overflow: visible;
          flex-basis: auto;
        }
        .tablet-card-column-0 {
          flex-shrink: 1;
          flex-grow: 1;
          flex-basis: auto;
        }
      }

      .tablet-card-logo {
        width: 100%;
        max-height: 25vw;
        object-fit: contain;
      }
    `;
  }
}
